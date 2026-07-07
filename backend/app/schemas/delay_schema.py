from pydantic import BaseModel
from app.schemas.agent_metadata import AgentMetadata

class DelayResult(BaseModel):
    total_detention_days: int
    delay_reason: str
    is_prolonged: bool
    root_cause: str

class DelayReport(BaseModel):
    result: DelayResult
    metadata: AgentMetadata
