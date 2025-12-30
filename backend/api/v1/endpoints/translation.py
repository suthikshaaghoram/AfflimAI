"""
Translation API endpoints.
Provides RAG-based high-fidelity translation for manifestations.
"""

from fastapi import APIRouter, HTTPException
from app.schemas import TranslationRequest, TranslationResponse
from app.rag_translate import translate_with_rag, get_supported_languages
import logging
import os
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post(
    "/translate-manifestation",
    response_model=TranslationResponse,
    summary="Translate manifestation to another language",
    description="Translates English manifestation using RAG for high-fidelity, context-aware translation."
)
async def translate_manifestation(request: TranslationRequest):
    """
    Translate an English manifestation to a target language.
    
    Uses RAG (Retrieval-Augmented Generation) with vector database to ensure:
    - Consistent translation of repeated phrases
    - Preservation of emotional tone
    - Maintenance of manifestation intent
    
    Supported languages:
    - ta: Tamil (தமிழ்)
    - hi: Hindi (हिन्दी)
    """
    try:
        logger.info(f"Translation request for language: {request.target_language}")
        
        # Validate language
        supported = get_supported_languages()
        if request.target_language not in supported:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported language: {request.target_language}. "
                       f"Supported: {', '.join(supported.keys())}"
            )
        
        # Get language info
        lang_info = supported[request.target_language]
        
        # Set username for vector store
        username = request.username or "anonymous"
        
        # Perform RAG-based translation
        translated_text = translate_with_rag(
            text=request.text,
            target_language=request.target_language,
            username=username
        )
        
        # Save translated output to file
        if request.username:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_username = "".join(
                c for c in request.username 
                if c.isalnum() or c in (' ', '_', '-')
            ).strip().replace(' ', '_')
            
            filename = f"{safe_username}_{request.target_language}_{timestamp}.txt"
            output_dir = "outputs"
            os.makedirs(output_dir, exist_ok=True)
            file_path = os.path.join(output_dir, filename)
            
            # Save translated text
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(translated_text)
            
            logger.info(f"Saved translation to: {file_path}")
        
        # Return response
        return TranslationResponse(
            status="success",
            language=lang_info["name"],
            language_code=request.target_language,
            translated_text=translated_text
        )
    
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

@router.get(
    "/supported-languages",
    summary="Get supported languages",
    description="Returns a list of all supported target languages for translation."
)
async def get_languages():
    """
    Get information about supported languages.
    """
    return {
        "status": "success",
        "languages": get_supported_languages()
    }
