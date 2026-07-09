import os
import io
import fitz  # PyMuPDF
from PIL import Image
import google.generativeai as genai
import logging
from app.config.settings import settings

logger = logging.getLogger(__name__)

# Configure Gemini for Image OCR
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class OCRService:
    def __init__(self):
        pass

    def extract_text_from_image(self, image_bytes: bytes) -> str:
        try:
            if not settings.GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY is not set. Cannot perform image OCR.")
            
            image = Image.open(io.BytesIO(image_bytes))
            
            model = genai.GenerativeModel(settings.LLM_MODEL)
            prompt = "Extract all the text visible in this image verbatim. The handwriting might be extremely messy or cursive. Do your absolute best to transcribe it. If you can't read a word, guess it based on context or use [unreadable]. Do not describe the image, just output the text exactly as it appears."
            
            response = model.generate_content([prompt, image])
            return response.text.strip() if response.text else "Unreadable image"
        except Exception as e:
            logger.error(f"Failed to extract text from image using Gemini: {e}")
            raise e

    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            full_text = []
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                # Native text extraction (extremely fast, requires no OCR binary)
                text = page.get_text()
                full_text.append(text)
                
            return "\n\n".join(full_text).strip()
        except Exception as e:
            logger.error(f"Failed to natively extract text from PDF: {e}")
            raise e

    def process_file(self, file_bytes: bytes, filename: str) -> str:
        """
        Detects file type based on extension and runs the appropriate extraction.
        """
        ext = filename.split('.')[-1].lower() if '.' in filename else ''
        
        if ext == 'pdf':
            return self.extract_text_from_pdf(file_bytes)
        elif ext in ['png', 'jpg', 'jpeg', 'webp']:
            return self.extract_text_from_image(file_bytes)
        else:
            raise ValueError(f"Unsupported file type: {ext}")

ocr_service = OCRService()
