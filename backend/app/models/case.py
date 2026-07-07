from pydantic import BaseModel, Field
from typing import Optional, List

class CaseModel(BaseModel):
    caseId: str
    undertrialName: str
    gender: Optional[str] = None
    age: Optional[int] = None
    district: Optional[str] = None
    court: Optional[str] = None
    FIRNumber: Optional[str] = None
    charges: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    eligibility: Optional[str] = None
    detentionStartDate: Optional[str] = None
    lastHearing: Optional[str] = None
    nextHearing: Optional[str] = None
    suretyAmount: Optional[int] = None
    summary: Optional[str] = None
