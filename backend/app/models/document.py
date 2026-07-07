from pydantic import BaseModel
from typing import Optional

class DocumentModel(BaseModel):
    documentId: str
    caseId: str
    documentName: str
    documentType: str
    uploadedDate: Optional[str] = None
    status: Optional[str] = None
    extracted_text: Optional[str] = None # Added post-parsing
