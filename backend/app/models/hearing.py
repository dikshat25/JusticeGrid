from pydantic import BaseModel
from typing import Optional

class HearingModel(BaseModel):
    hearingId: str
    caseId: str
    date: str
    court: Optional[str] = None
    remarks: Optional[str] = None
    status: Optional[str] = None
