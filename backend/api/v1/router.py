from fastapi import APIRouter
from .endpoints import manifestation, tts, translation, background_audio, finalize

api_router = APIRouter()

api_router.include_router(manifestation.router, tags=["Manifestation"])
api_router.include_router(tts.router, tags=["TTS"])
api_router.include_router(translation.router, tags=["Translation"])
api_router.include_router(background_audio.router, tags=["Background Audio"])
api_router.include_router(finalize.router, tags=["Finalization"])

