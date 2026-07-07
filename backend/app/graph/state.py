from typing import TypedDict, Optional, Dict, Any

class JusticeState(TypedDict):
    # Execution Tracking
    run_id: str
    case_id: str
    started_at: str
    completed_at: Optional[str]
    status: str
    execution_time: Optional[float]
    failed_node: Optional[str]

    # Data
    case_data: Dict[str, Any]
    documents: list[Dict[str, Any]]
    normalized_case: Dict[str, Any]

    # Agent Outputs
    eligibility: Optional[Dict[str, Any]]
    delay: Optional[Dict[str, Any]]
    financial: Optional[Dict[str, Any]]
    strategy: Optional[Dict[str, Any]]
    
    # Review
    merged_data: Optional[Dict[str, Any]]
    third_opinion: Optional[Dict[str, Any]]
    final_report: Optional[Dict[str, Any]]
    
    errors: list[str]
    timeline: list[Dict[str, Any]]
    transcript: list[Dict[str, Any]]
