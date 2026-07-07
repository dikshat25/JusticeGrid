from pydantic import BaseModel, Field
from app.schemas.agent_metadata import AgentMetadata

class AgentThinkingResult(BaseModel):
    finding: str = Field(description="The core finding or conclusion of this agent.")
    reasoning: str = Field(description="Step-by-step reasoning explaining the finding.")
    legal_references: str = Field(description="Applicable legal sections, case laws, or procedural rules.")
    recommendation: str = Field(description="The exact recommendation the agent makes to the courtroom.")
    confidence: int = Field(description="Confidence score from 0 to 100.")

class IntakeThinkingResult(BaseModel):
    case_summary: str = Field(description="A concise summary of the case.")
    key_facts: str = Field(description="The most critical legal facts extracted from the case.")
    missing_evidence: str = Field(description="Any missing information or evidence that could be crucial.")
    initial_observations: str = Field(description="Initial observations regarding the case structure.")
    confidence: int = Field(description="Confidence score from 0 to 100.")

class AgentReport(BaseModel):
    result: AgentThinkingResult | IntakeThinkingResult
    metadata: AgentMetadata
