from fastapi import APIRouter
from app.schemas import ManifestationRequest, ManifestationResponse
from app.prompt import generate_manifestation_prompt
from app.hf_client import generate_text
import logging

# Initialize router specific to this endpoint
router = APIRouter()
logger = logging.getLogger(__name__)

@router.post(
    "/generate-manifestation",
    response_model=ManifestationResponse,
    summary="Generate a personalized manifestation passage",
    description="Accepts user details and generates a 500-word personalized manifestation using AI."
)
async def generate_manifestation(request: ManifestationRequest):
    """
    Endpoint to process manifestation generation requests.
    """
    try:
        logger.info(f"Received manifestation request for user: {request.preferred_name}")
        
        # 1. Build the prompt
        prompt = generate_manifestation_prompt(request)
        
        # 2. Generate text via Hugging Face API
        generated_text = generate_text(prompt)
        
        import os
        from datetime import datetime
        
        # 3. Save text to file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_username = "".join(c for c in request.preferred_name if c.isalnum() or c in (' ', '_', '-')).strip().replace(' ', '_')
        filename = f"{safe_username}_{timestamp}.txt"
        
        output_dir = "outputs"
        os.makedirs(output_dir, exist_ok=True)
        file_path = os.path.join(output_dir, filename)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(generated_text)
            
        logger.info(f"Saved manifestation to {file_path}")
        
        # 4. Return structured response
        return ManifestationResponse(
            status="success",
            message="Manifestation generated successfully",
            data={"manifestation_text": generated_text}
        )
    
    except Exception as e:
        logger.error(f"Internal Server Error: {str(e)}")
        # Raise the exception so FastAPI/Starlette handles it (or catch/re-raise properly)
        # Assuming app-level exception handlers or default 500 for unhandled exceptions.
        # But for clarity/safety inside the route:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))
