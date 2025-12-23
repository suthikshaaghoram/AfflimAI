from fastapi import APIRouter
from .endpoints import manifestation

api_router = APIRouter()

api_router.include_router(manifestation.router, tags=["Manifestation"])
