from pydantic import BaseModel
from app.schemas.agent_metadata import AgentMetadata

class StrategyResult(BaseModel):
    recommended_action: str
    arguments: str
    risk_level: str

class StrategyReport(BaseModel):
    result: StrategyResult
    metadata: AgentMetadata
