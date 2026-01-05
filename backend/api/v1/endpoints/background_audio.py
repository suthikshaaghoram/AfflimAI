from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from pathlib import Path
import shutil
import os
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

# Define base path for background audio
# Assuming this file is at backend/api/v1/endpoints/background_audio.py
# We want backend/assets/background_audio
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent / "assets" / "background_audio"
BASE_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_TRACK_FILENAME = "manifestation-meditation-317860.mp3"

class BackgroundTrack(BaseModel):
    id: str
    display_name: str
    filename: str
    is_default: bool
    url: Optional[str] = None

@router.get("/background-tracks", response_model=List[BackgroundTrack])
async def list_background_tracks():
    """
    List all available background audio tracks.
    """
    tracks = []
    
    # Ensure default track exists in the list
    default_track_path = BASE_DIR / DEFAULT_TRACK_FILENAME
    
    # Add default track
    tracks.append(BackgroundTrack(
        id="default-meditation",
        display_name="Calm Meditation (Recommended)",
        filename=DEFAULT_TRACK_FILENAME,
        is_default=True,
        url=f"/api/v1/background-tracks/{DEFAULT_TRACK_FILENAME}"
    ))
    
    # Scan for other files
    for file_path in BASE_DIR.glob("*"):
        if file_path.name == DEFAULT_TRACK_FILENAME:
            continue
            
        if file_path.suffix.lower() in ['.mp3', '.wav']:
            tracks.append(BackgroundTrack(
                id=file_path.stem,
                display_name=file_path.stem.replace("-", " ").title(),
                filename=file_path.name,
                is_default=False,
                url=f"/api/v1/background-tracks/{file_path.name}"
            ))
            
    return tracks

@router.get("/background-tracks/{filename}")
async def get_background_track(filename: str):
    """
    Stream a specific background audio track.
    """
    file_path = BASE_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Background track not found")
        
    return FileResponse(path=file_path, media_type="audio/mpeg")

@router.post("/upload-background-track", response_model=BackgroundTrack)
async def upload_background_track(file: UploadFile = File(...)):
    """
    Upload a custom background track.
    """
    # Validate file extension
    if not file.filename.lower().endswith(('.mp3', '.wav')):
        raise HTTPException(status_code=400, detail="Only .mp3 and .wav files are allowed")
        
    # Validate file size (e.g., max 10MB)
    MAX_SIZE = 10 * 1024 * 1024
    # Note: Checking size before read is tricky with UploadFile without reading, 
    # but we can check after saving or read in chunks. 
    # For now, let's just save and check size.
    
    try:
        # Sanitize filename
        safe_filename = Path(file.filename).name
        # avoid overwriting default
        if safe_filename == DEFAULT_TRACK_FILENAME:
            safe_filename = "custom_" + safe_filename
            
        file_path = BASE_DIR / safe_filename
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Check size
        if file_path.stat().st_size > MAX_SIZE:
            os.remove(file_path)
            raise HTTPException(status_code=400, detail="File too large (max 10MB)")
            
        return BackgroundTrack(
            id=file_path.stem,
            display_name=file_path.stem.replace("-", " ").title(),
            filename=safe_filename,
            is_default=False,
            url=f"/api/v1/background-tracks/{safe_filename}"
        )
        
    except Exception as e:
        if 'file_path' in locals() and file_path.exists():
             os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
