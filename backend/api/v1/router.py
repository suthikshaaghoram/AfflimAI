from fastapi import APIRouter
from .endpoints import manifestation, tts

api_router = APIRouter()

api_router.include_router(manifestation.router, tags=["Manifestation"])
api_router.include_router(tts.router, tags=["TTS"])
