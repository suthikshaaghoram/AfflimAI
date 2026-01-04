from fastapi import APIRouter
from app.schemas import ManifestationRequest, ManifestationResponse, ManifestationData
from app.prompt import generate_manifestation_prompt
from app.hf_client import generate_text
from app.text_validator import validate_mode, enforce_word_limit
import logging

# Initialize router specific to this endpoint
router = APIRouter()
logger = logging.getLogger(__name__)

@router.post(
    "/generate-manifestation",
    response_model=ManifestationResponse,
    summary="Generate a personalized manifestation passage",
    description="Accepts user details and generates a personalized manifestation using AI. Supports 'quick' (~2 min) and 'deep' (~4 min) modes."
)
async def generate_manifestation(request: ManifestationRequest):
    """
    Endpoint to process manifestation generation requests with mode control.
    Supports 'quick' and 'deep' modes with strict word limits.
    """
    try:
        # 1. Validate and normalize mode
        mode = validate_mode(request.generation_mode)
        logger.info(f"Received manifestation request for user: {request.preferred_name} in '{mode}' mode")
        
        # 2. Build mode-specific prompt
        prompt = generate_manifestation_prompt(request, generation_mode=mode)
        
        # 3. Generate text via Hugging Face API
        generated_text = generate_text(prompt)
        
        # 4. ENFORCE word limit (safety net)
        validated_text, word_count, was_trimmed = enforce_word_limit(generated_text, mode)
        
        if was_trimmed:
            logger.warning(f"LLM output exceeded limit and was trimmed to {word_count} words")
        else:
            logger.info(f"Generated manifestation: {word_count} words (within limits)")
        
        import os
        from datetime import datetime
        
        # 5. Save text and input data to file with mode metadata
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_username = "".join(c for c in request.preferred_name if c.isalnum() or c in (' ', '_', '-')).strip().replace(' ', '_')
        filename = f"{safe_username}_{mode}_{timestamp}.txt"
        
        output_dir = "outputs"
        os.makedirs(output_dir, exist_ok=True)
        file_path = os.path.join(output_dir, filename)
        
        # Save with metadata header
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(f"# Generation Mode: {mode}\n")
            f.write(f"# Word Count: {word_count}\n")
            f.write(f"# Generated: {timestamp}\n")
            f.write(f"# User: {request.preferred_name}\n\n")
            f.write(validated_text)

        # Save Last Submission Data (with mode)
        import json
        last_submission_path = os.path.join(output_dir, "last_submission.json")
        submission_data = request.dict()
        submission_data["generation_mode"] = mode  # Ensure mode is saved
        with open(last_submission_path, "w", encoding="utf-8") as f:
            json.dump(submission_data, f, indent=4)
            
        logger.info(f"Saved manifestation to {file_path} ({word_count} words, mode: {mode})")
        
        # 6. Return structured response with metadata
        return ManifestationResponse(
            status="success",
            message=f"Manifestation generated successfully in '{mode}' mode",
            data=ManifestationData(
                manifestation_text=validated_text,
                generation_mode=mode,
                word_count=word_count
            )
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
