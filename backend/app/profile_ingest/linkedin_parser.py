from fastapi import UploadFile, HTTPException
import pypdf
import io
import re
import logging

logger = logging.getLogger(__name__)

async def parse_linkedin_pdf(file: UploadFile) -> str:
    """
    Extracts clean text from a LinkedIn PDF export.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        content = await file.read()
        pdf_file = io.BytesIO(content)
        reader = pypdf.PdfReader(pdf_file)
        
        full_text = ""
        for page in reader.pages:
            full_text += page.extract_text() + "\n"
            
        # Basic cleanup
        # Remove common LinkedIn PDF artifacts
        full_text = re.sub(r'Contact\nwww.linkedin.com/in/.*', '', full_text)
        full_text = re.sub(r'Page \d+ of \d+', '', full_text)
        
        # Remove multiple newlines
        full_text = re.sub(r'\n\s*\n', '\n\n', full_text)
        
        logger.info(f"Parsed PDF. Length: {len(full_text)} chars")
        return full_text.strip()
        
    except Exception as e:
        logger.error(f"Error parsing PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")

def clean_profile_text(text: str) -> str:
    """
    Cleans raw text input.
    """
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text
