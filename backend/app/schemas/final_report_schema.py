from pydantic import BaseModel
from typing import Dict, Any
from app.schemas.agent_metadata import AgentMetadata

class FinalReportResult(BaseModel):
    executive_summary: str
    action_items: list[str]
    merged_data: Dict[str, Any]

class FinalReport(BaseModel):
    result: FinalReportResult
    metadata: AgentMetadata
