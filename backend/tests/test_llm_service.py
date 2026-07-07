import pytest
import asyncio
from app.config.settings import settings
from app.services.llm_service import llm_service
from app.schemas.agent_schemas import AgentThinkingResult

@pytest.mark.asyncio
async def test_llm_service_mock_mode():
    settings.MOCK_MODE = True
    llm_service.mock_mode = True
    
    response = await llm_service.generate_with_fallback("Test prompt", AgentThinkingResult)
    assert response["provider_used"] == "MockProvider"
    assert response["result"].finding == "Mock finding"
