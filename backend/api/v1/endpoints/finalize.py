from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
from pydub import AudioSegment
import logging
from datetime import datetime
import os

router = APIRouter()
logger = logging.getLogger(__name__)

# Explicitly set ffmpeg path (Homebrew location)
AudioSegment.converter = "/opt/homebrew/bin/ffmpeg"
AudioSegment.ffprobe = "/opt/homebrew/bin/ffprobe"

# Paths - Assuming similar structure to other endpoints
# Paths - Absolute paths to avoid CWD issues
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
BASE_ASSETS_DIR = BASE_DIR / "assets" / "background_audio"
TEMP_AUDIO_DIR = BASE_DIR / "temp_audio"
OUTPUTS_DIR = BASE_DIR / "outputs"

# Ensure directories exist
TEMP_AUDIO_DIR.mkdir(exist_ok=True)
OUTPUTS_DIR.mkdir(exist_ok=True)

class FinalizeAudioRequest(BaseModel):
    voice_filename: str
    background_track_id: str
    bg_volume: int # 0-100
    voice_volume: int = 100 # Default to 100 if not provided
    username: str

def locate_voice_file(filename: str) -> Path:
    logger.info(f"Locating file: {filename}")
    
    # Check outputs first (persistent)
    path = OUTPUTS_DIR / filename
    if path.exists():
        logger.info(f"Found in outputs: {path}")
        return path
        
    # Check temp
    path = TEMP_AUDIO_DIR / filename
    if path.exists():
        logger.info(f"Found in temp: {path}")
        return path
        
    # Also handle if filename doesn't have extension
    if not filename.lower().endswith(".mp3"):
        path = OUTPUTS_DIR / f"{filename}.mp3"
        if path.exists():
            return path
        path = TEMP_AUDIO_DIR / f"{filename}.mp3"
        if path.exists():
            return path
            
    logger.error(f"File not found in {OUTPUTS_DIR} or {TEMP_AUDIO_DIR}")
    return None

def locate_background_file(track_id: str) -> Path:
    # If id has extension, check directly
    if track_id.lower().endswith(('.mp3', '.wav')):
        path = BASE_ASSETS_DIR / track_id
        if path.exists():
            return path
            
    # Check by id (filename usually equals id + extension in basic implementations,
    # or we scan for it)
    # Our background_audio.py logic used stem as ID.
    # Let's search for file with matching stem
    for file_path in BASE_ASSETS_DIR.glob("*"):
        if file_path.stem == track_id:
            return file_path
            
    return None

@router.post("/finalize-audio", response_class=FileResponse)
async def finalize_audio(request: FinalizeAudioRequest):
    """
    Permanently merge voice and background audio.
    """
    logger.info(f"Finalizing audio: voice={request.voice_filename}, bg={request.background_track_id}, vol={request.bg_volume}")
    
    try:
        # 1. Locate Voice File
        voice_path = locate_voice_file(request.voice_filename)
        if not voice_path:
            raise HTTPException(status_code=404, detail="Voice audio file not found")
            
        # 2. Locate Background File
        bg_path = None
        if request.background_track_id and request.background_track_id != "none":
            bg_path = locate_background_file(request.background_track_id)
            if not bg_path:
                logger.warning(f"Background track {request.background_track_id} not found, proceeding with voice only")
        
        # 3. Load Audio
        try:
            voice_audio = AudioSegment.from_file(str(voice_path))
            
            # Adjust Voice Volume if needed
            if request.voice_volume < 100:
                import math
                ratio = request.voice_volume / 100.0
                if ratio <= 0.01:
                    gain_db = -100
                else:
                    gain_db = 20 * math.log10(ratio)
                voice_audio = voice_audio + gain_db
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to load voice audio: {str(e)}")
            
        final_audio = voice_audio
        
        # 4. Process Background if exists and volume > 0
        if bg_path and request.bg_volume > 0:
            try:
                bg_audio = AudioSegment.from_file(str(bg_path))
                
                # Adjust volume
                # Pydub uses dB. 100% = original volume? Or amplified?
                # User scale: 0% (mute) to 100% (max reasonable)
                # Let's assume input background tracks are standard normalized music.
                # Voice should be dominant.
                # At 100% intensity, let's keep it slightly below voice (-5dB to -3dB relative to voice?)
                # Actually, let's map 0-100 linear scale to dB attenuation.
                # 100% -> 0dB attenuation (original)
                # 50% -> -6dB?
                # 0% -> -inf
                
                # Better approach: Gain calculation
                # target_db = (volume_percent / 100) * range - attenuation_offset
                
                # Simple approach: Pydub allow reducing volume by gain_db = 20 * log10(amplitude_ratio)
                # ratio = vol / 100
                import math
                if request.bg_volume < 100:
                    ratio = request.bg_volume / 100.0
                    if ratio <= 0.01:
                       gain_db = -100 # effectively mute
                    else:
                       gain_db = 20 * math.log10(ratio)
                    
                    bg_audio = bg_audio + gain_db
                
                # Loop background to match voice duration
                voice_len = len(voice_audio)
                bg_len = len(bg_audio)
                
                if bg_len < voice_len:
                    loops = int(voice_len / bg_len) + 1
                    bg_audio = bg_audio * loops
                    
                # Trim to exact length
                bg_audio = bg_audio[:voice_len]
                
                # Fade in/out (2s = 2000ms)
                bg_audio = bg_audio.fade_in(2000).fade_out(2000)
                
                # Overlay
                # position=0
                final_audio = voice_audio.overlay(bg_audio)
                
            except Exception as e:
                logger.error(f"Error processing background audio: {e}")
                # Fallback to voice only
                
        # 5. Export Final File
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_username = "".join(c for c in request.username if c.isalnum() or c in (' ', '_', '-')).strip().replace(' ', '_')
        final_filename = f"{safe_username}_final_manifestation_{timestamp}.mp3"
        final_path = OUTPUTS_DIR / final_filename
        
        final_audio.export(str(final_path), format="mp3", bitrate="192k")
        
        # 6. Cleanup (Optional: don't delete original voice to be safe, per prompt)
        
        return FileResponse(
            path=final_path,
            filename=final_filename,
            media_type="audio/mpeg"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Finalization failed: {e}")
        raise HTTPException(status_code=500, detail=f"Finalization failed: {str(e)}")
