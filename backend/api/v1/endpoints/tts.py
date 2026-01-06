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
    description="Converts text to audio with emotion-aware voice modulation. Supports calm, balanced, and uplifting styles."
)
async def generate_audio_endpoint(request: AudioRequest, background_tasks: BackgroundTasks):
    """
    Generate audio with emotion-aware voice modulation.
    
    Supports three voice styles:
    - calm: Meditative, soothing (default) - lower pitch, slower rate
    - balanced: Natural, neutral narration - neutral prosody
    - uplifting: Motivational, positive energy - higher pitch, dynamic
    """
    try:
        voice_style = request.voice_style or "calm"
        logger.info(f"Generating audio: lang={request.language}, gender={request.gender}, style={voice_style}, text_len={len(request.text)}")
        
        from datetime import datetime
        
        # Determine filename if username is provided
        custom_filename = None
        if request.username:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_username = "".join(c for c in request.username if c.isalnum() or c in (' ', '_', '-')).strip().replace(' ', '_')
            custom_filename = f"{safe_username}_{request.language}_{voice_style}_{timestamp}"
            
        # Generate audio with voice style
        file_path = await generate_audio_file(
            text=request.text,
            gender=request.gender,
            language=request.language,
            filename=custom_filename,
            voice_style=voice_style  # Pass voice style
        )
        
        # Only schedule cleanup if it's a temporary file (no username provided)
        # if not custom_filename:
        #     background_tasks.add_task(cleanup_file, file_path)
        
        download_filename = f"{custom_filename}.mp3" if custom_filename else "manifestation.mp3"
            
        return FileResponse(
            file_path,
            media_type="audio/mpeg",
            filename=download_filename
        )
    
    except Exception as e:
        logger.error(f"TTS Generation Error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
