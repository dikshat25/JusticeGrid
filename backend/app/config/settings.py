from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "JusticeGrid Backend API"
    API_V1_STR: str = "/api/v1"
    
    FIREBASE_CREDENTIALS_PATH: str = "./serviceAccountKey.json"
    GEMINI_API_KEY: str = ""
    LLM_MODEL: str = "gemini-3.1-flash-lite"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "google/gemma-7b-it:free"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
