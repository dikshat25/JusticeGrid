from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AgentMetadata(BaseModel):
    agent_name: str
    version: str = "1.0"
    execution_time: Optional[float] = None
    confidence: Optional[float] = None
    timestamp: str = str(datetime.utcnow())
    status: str = "SUCCESS"
    error_message: Optional[str] = None
    provider_used: Optional[str] = None
    model_used: Optional[str] = None
    retries_attempted: int = 0
    fallback_triggered: bool = False
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
