from pydantic import BaseModel
from app.schemas.agent_metadata import AgentMetadata

class ThirdOpinionResult(BaseModel):
    consensus_reached: bool
    dissenting_views: str
    final_verdict: str

class ThirdOpinionReport(BaseModel):
    result: ThirdOpinionResult
    metadata: AgentMetadata
