import logging
from pydantic import BaseModel, Field
from app.services.llm_service import llm_service
from typing import Optional

logger = logging.getLogger(__name__)

class FIRParseResult(BaseModel):
    undertrialName: Optional[str] = Field(description="Name of the accused/undertrial")
    firNumber: Optional[str] = Field(description="FIR number or crime number")
    policeStation: Optional[str] = Field(description="Name of the police station")
    district: Optional[str] = Field(description="District of the police station or court")
    court: Optional[str] = Field(description="Name of the court")
    judge: Optional[str] = Field(description="Name of the judge")
    charges: Optional[str] = Field(description="IPC or BNS sections and description of charges")
    detentionStartDate: Optional[str] = Field(description="Date of arrest or detention start in YYYY-MM-DD format")
    priority: Optional[str] = Field(description="Estimate priority: High, Medium, or Low based on severity")
    age: Optional[str] = Field(description="Age of the accused")
    gender: Optional[str] = Field(description="Gender of the accused (Male, Female, Other)")

class DocumentClassifyResult(BaseModel):
    documentType: str = Field(description="Classification of document: Medical Certificate, Income Certificate, Aadhaar, Residence Proof, Surety Bond, Character Certificate, Prison Medical Record, or Other")
    summary: str = Field(description="A brief 1-2 sentence summary of what this document proves or contains")
    confidence: int = Field(description="Confidence score out of 100")

class DocumentParser:
    async def parse_fir(self, ocr_text: str) -> FIRParseResult:
        if not ocr_text or len(ocr_text.strip()) < 10:
            raise ValueError("OCR text is empty or too short.")
            
        prompt = f"""
        You are a legal assistant parser. 
        Extract the following case details from the provided FIR/Chargesheet OCR text. 
        If a field is not found or unclear, leave it as null.
        
        OCR TEXT:
        {ocr_text[:3000]} # Limiting to avoid massive context
        """
        
        try:
            response = await llm_service.generate_with_fallback(prompt, schema=FIRParseResult)
            return response["result"]
        except Exception as e:
            logger.error(f"Failed to parse FIR: {e}")
            raise e

    async def classify_document(self, ocr_text: str) -> DocumentClassifyResult:
        if not ocr_text or len(ocr_text.strip()) < 10:
            raise ValueError("OCR text is empty or too short.")
            
        prompt = f"""
        You are a legal document classification assistant.
        Analyze the following OCR text from an uploaded document.
        Determine the document type and provide a brief summary.
        
        OCR TEXT:
        {ocr_text[:3000]}
        """
        
        try:
            response = await llm_service.generate_with_fallback(prompt, schema=DocumentClassifyResult)
            return response["result"]
        except Exception as e:
            logger.error(f"Failed to classify document: {e}")
            raise e

document_parser = DocumentParser()
