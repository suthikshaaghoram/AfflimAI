from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from app.schemas import AudioRequest
from app.tts import generate_audio_file
from pathlib import Path
from datetime import datetime
import logging
import os

router = APIRouter(prefix="/v1")
logger = logging.getLogger(__name__)

def cleanup_file(path: str):
    """Cleanup temporary audio file after response"""
    try:
        os.remove(path)
        logger.info(f"Deleted temp file: {path}")
    except Exception as e:
        logger.error(f"Error deleting {path}: {e}")
OUTPUTS_DIR = Path("/home/ubuntu/AfflimAI/backend/outputs")
OUTPUTS_DIR.mkdir(exist_ok=True)


from pydub import AudioSegment
import shutil

ffmpeg_path = shutil.which("ffmpeg")
ffprobe_path = shutil.which("ffprobe")

if not ffmpeg_path or not ffprobe_path:
    raise RuntimeError("ffmpeg/ffprobe not found in PATH")

AudioSegment.converter = ffmpeg_path
AudioSegment.ffprobe = ffprobe_path


@router.post(
    "/generate-audio",
    response_class=FileResponse,
    summary="Generate audio from text (TTS)",
    description="Converts text to audio with emotion-aware voice modulation."
)
async def generate_audio_endpoint(
    request: AudioRequest,
    background_tasks: BackgroundTasks
):
    try:
        voice_style = request.voice_style or "calm"

        logger.info(
            f"Generating audio: lang={request.language}, "
            f"gender={request.gender}, style={voice_style}, "
            f"text_len={len(request.text)}"
        )

        # 🕒 Timestamped, safe filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_username = (
            "".join(
                c for c in (request.username or "user")
                if c.isalnum() or c in (" ", "_", "-")
            )
            .strip()
            .replace(" ", "_")
        )

        voice_filename = (
            f"{safe_username}_{request.language}_{voice_style}_{timestamp}.mp3"
        )

        final_voice_path = OUTPUTS_DIR / voice_filename

        # 🎙️ Generate audio (TEMP file returned)
        temp_file_path = await generate_audio_file(
            text=request.text,
            gender=request.gender,
            language=request.language,
            filename=None,  # let TTS decide temp name
            voice_style=voice_style,
        )

        # 🔥 CRITICAL FIX: persist audio into outputs/
        logger.info(f"Persisting voice audio to: {final_voice_path}")
        os.replace(temp_file_path, final_voice_path)

        # ✅ Hard verification (never skip this)
        if not final_voice_path.exists():
            raise RuntimeError("Voice audio file was not saved to outputs directory")

        logger.info(f"Voice file successfully created: {final_voice_path}")

        return FileResponse(
            path=final_voice_path,
            media_type="audio/mpeg",
            filename=voice_filename,
        )

    except Exception as e:
        logger.error("TTS Generation Error", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
