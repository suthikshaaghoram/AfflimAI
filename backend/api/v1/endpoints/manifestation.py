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
        
        # 3. Save text and input data to file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_username = "".join(c for c in request.preferred_name if c.isalnum() or c in (' ', '_', '-')).strip().replace(' ', '_')
        filename = f"{safe_username}_{timestamp}.txt"
        
        output_dir = "outputs"
        os.makedirs(output_dir, exist_ok=True)
        file_path = os.path.join(output_dir, filename)
        
        # Save Generated Text
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(generated_text)

        # Save Last Submission Data
        import json
        last_submission_path = os.path.join(output_dir, "last_submission.json")
        with open(last_submission_path, "w", encoding="utf-8") as f:
            json.dump(request.dict(), f, indent=4)
            
        logger.info(f"Saved manifestation to {file_path} and data to {last_submission_path}")
        
        # 4. Return structured response
        return ManifestationResponse(
            status="success",
            message="Manifestation generated successfully",
            data={"manifestation_text": generated_text}
        )
    
    except Exception as e:
        logger.error(f"Internal Server Error: {str(e)}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

@router.get(
    "/last-submission",
    response_model=ManifestationRequest,
    summary="Get last submitted data",
    description="Retrieves the input data from the last successful manifestation generation."
)
async def get_last_submission():
    """
    Retrieve the last submission data to auto-fill the form.
    """
    import os
    import json
    from fastapi import HTTPException
    
    output_dir = "outputs"
    last_submission_path = os.path.join(output_dir, "last_submission.json")
    
    if not os.path.exists(last_submission_path):
        raise HTTPException(status_code=404, detail="No previous submission found")
        
    try:
        with open(last_submission_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        logger.error(f"Error reading last submission: {e}")
        raise HTTPException(status_code=500, detail="Failed to read last submission data")
