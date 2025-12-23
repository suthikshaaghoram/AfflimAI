from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1.router import api_router
import logging

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

# Initialize FastAPI App
app = FastAPI(
    title="AffirmAI API",
    description="AI-powered affirmation and manifestation platform backend.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS (Optional but recommended for frontend integration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Router (Prefixing with /api/v1 for clearer structure)
app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["Health"])
async def root():
    """
    Health check endpoint.
    """
    return {"message": "AffirmAI Backend is running. Visit /docs for API documentation."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
