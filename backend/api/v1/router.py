from fastapi import APIRouter
from .endpoints import manifestation, tts, translation

api_router = APIRouter()

api_router.include_router(manifestation.router, tags=["Manifestation"])
api_router.include_router(tts.router, tags=["TTS"])
api_router.include_router(translation.router, tags=["Translation"])

