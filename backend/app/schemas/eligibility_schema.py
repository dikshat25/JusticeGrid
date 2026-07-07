from pydantic import BaseModel
from app.schemas.agent_metadata import AgentMetadata

class EligibilityResult(BaseModel):
    eligible: bool
    reasoning: str
    recommendation: str
    legal_reference: str
    priority_score: int

class EligibilityReport(BaseModel):
    result: EligibilityResult
    metadata: AgentMetadata
