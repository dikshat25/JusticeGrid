from pydantic import BaseModel
from app.schemas.agent_metadata import AgentMetadata

class FinancialResult(BaseModel):
    surety_amount: int
    can_afford: bool
    alternative_options: str

class FinancialReport(BaseModel):
    result: FinancialResult
    metadata: AgentMetadata
