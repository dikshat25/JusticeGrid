import asyncio
from abc import ABC, abstractmethod
from pydantic import BaseModel
import time
import json

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from app.config.settings import settings

class BaseLLMProvider(ABC):
    def __init__(self, name: str, model_name: str):
        self.name = name
        self.model_name = model_name
        self.unhealthy_until: float = 0

    @abstractmethod
    async def generate(self, prompt: str, schema=None):
        pass

class GroqProvider(BaseLLMProvider):
    def __init__(self):
        super().__init__("Groq", settings.GROQ_MODEL)
        self.llm = ChatGroq(
            temperature=0.2,
            model_name=self.model_name,
            groq_api_key=settings.GROQ_API_KEY
        )

    async def generate(self, prompt: str, schema=None):
        if schema:
            structured_llm = self.llm.with_structured_output(schema)
            return await structured_llm.ainvoke(prompt)
        result = await self.llm.ainvoke(prompt)
        return result.content

class GeminiProvider(BaseLLMProvider):
    def __init__(self):
        super().__init__("Gemini", settings.LLM_MODEL)
        self.llm = ChatGoogleGenerativeAI(
            model=self.model_name,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2
        )

    async def generate(self, prompt: str, schema=None):
        if schema:
            structured_llm = self.llm.with_structured_output(schema)
            return await structured_llm.ainvoke(prompt)
        result = await self.llm.ainvoke(prompt)
        return result.content

class OpenRouterProvider(BaseLLMProvider):
    def __init__(self):
        super().__init__("OpenRouter", settings.OPENROUTER_MODEL)
        self.llm = ChatOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_API_KEY,
            model=self.model_name,
            temperature=0.2
        )

    async def generate(self, prompt: str, schema=None):
        if schema:
            structured_llm = self.llm.with_structured_output(schema)
            return await structured_llm.ainvoke(prompt)
        result = await self.llm.ainvoke(prompt)
        return result.content

class LLMService:
    def __init__(self):
        self.semaphore = asyncio.Semaphore(3)
        self.providers = []
        if settings.GROQ_API_KEY:
            self.providers.append(GroqProvider())
        if settings.OPENROUTER_API_KEY:
            self.providers.append(OpenRouterProvider())
        if settings.GEMINI_API_KEY:
            self.providers.append(GeminiProvider())

        if not self.providers:
            raise ValueError("No LLM API keys provided in .env. Cannot initialize LLM providers.")

    async def generate_with_fallback(self, prompt: str, schema=None):
        async with self.semaphore:
            
            for index, provider in enumerate(self.providers):
                if time.time() < provider.unhealthy_until:
                    print(f"{provider.name} skipped (cooldown active)")
                    continue
                    
                retries_attempted = 0
                max_retries = 2
                base_delay = 2
                
                while retries_attempted <= max_retries:
                    try:
                        start_time = time.time()
                        result = await provider.generate(prompt, schema)
                        latency = time.time() - start_time
                        
                        return {
                            "result": result,
                            "provider_used": provider.name,
                            "model_used": provider.model_name,
                            "latency": latency,
                            "retries_attempted": retries_attempted,
                            "fallback_triggered": index > 0,
                            "prompt_tokens": 0,
                            "completion_tokens": 0
                        }
                    except Exception as e:
                        error_msg = str(e).lower()
                        print(f"[{provider.name} FAILED (Attempt {retries_attempted + 1})]: {str(e)}")
                        
                        is_temporary = any(term in error_msg for term in ["429", "503", "timeout", "network", "rate limit", "service unavailable"])
                        
                        if not is_temporary or retries_attempted == max_retries:
                            if is_temporary:
                                print(f"Exhausted retries for {provider.name}. Marking unhealthy for 60s.")
                                provider.unhealthy_until = time.time() + 60
                            print(f"Failing over to next provider...")
                            break
                            
                        delay = base_delay * (2 ** retries_attempted)
                        print(f"Retrying {provider.name} in {delay}s...")
                        await asyncio.sleep(delay)
                        retries_attempted += 1

            raise Exception("All LLM providers failed to generate a response.")

llm_service = LLMService()
