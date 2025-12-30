from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from app.schemas import AudioRequest
from app.tts import generate_audio_file
import logging
import os

router = APIRouter()
logger = logging.getLogger(__name__)

def cleanup_file(path: str):
    """Cleanup temporary audio file after response"""
    try:
        os.remove(path)
        logger.info(f"Deleted temp file: {path}")
    except Exception as e:
        logger.error(f"Error deleting {path}: {e}")

@router.post(
    "/generate-audio",
    response_class=FileResponse,
    summary="Generate audio from text (TTS)",
    description="Converts text to audio. Supports Male/Female voices in English, Tamil, and Hindi."
)
async def generate_audio_endpoint(request: AudioRequest, background_tasks: BackgroundTasks):
    """
    Endpoint to generate audio from text with multi-language support.
    """
    try:
        logger.info(f"Generating audio: language={request.language}, gender={request.gender}, text_length={len(request.text)}")
        
        from datetime import datetime
        
        # Determine filename if username is provided
        custom_filename = None
        if request.username:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_username = "".join(c for c in request.username if c.isalnum() or c in (' ', '_', '-')).strip().replace(' ', '_')
            custom_filename = f"{safe_username}_{request.language}_{timestamp}"
            
        # Generate audio with language support
        file_path = await generate_audio_file(
            text=request.text,
            gender=request.gender,
            language=request.language,  # Pass language parameter
            filename=custom_filename
        )
        
        # Only schedule cleanup if it's a temporary file (no username provided)
        if not custom_filename:
            background_tasks.add_task(cleanup_file, file_path)
        
        download_filename = f"{custom_filename}.mp3" if custom_filename else "manifestation.mp3"
            
        return FileResponse(
            file_path,
            media_type="audio/mpeg",
            filename=download_filename
        )
    
    except Exception as e:
        logger.error(f"TTS Generation Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
