import requests
import logging
from .config import settings
from fastapi import HTTPException

logger = logging.getLogger(__name__)

def generate_text(prompt: str) -> str:
    """
    Calls the Hugging Face Router API (OpenAI compatible) to generate text.
    """
    # Use the OpenAI-compatible endpoint on the router
    api_url = "https://router.huggingface.co/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Construct OpenAI-style payload
    payload = {
        "model": settings.MODEL_ID,
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 600,
        "temperature": 0.7,
        "top_p": 0.9,
        "stream": False
    }

    try:
        response = requests.post(api_url, headers=headers, json=payload, timeout=60)
        
        if response.status_code != 200:
             logger.error(f"HF API Error: {response.status_code} - {response.text}")
             raise HTTPException(status_code=502, detail=f"AI Provider Error: {response.text}")

        result = response.json()
        
        # Parse OpenAI-style response
            content = result['choices'][0]['message']['content']
            # Remove newlines and ensure single spacing
            return content.replace('\n', ' ').strip()
        else:
            logger.error(f"Unexpected response format: {result}")
            raise HTTPException(status_code=502, detail="Unexpected response from AI provider")

    except requests.exceptions.Timeout:
        logger.error("HF API Timeout")
        raise HTTPException(status_code=504, detail="AI generation timed out. Please try again.")
    except requests.exceptions.RequestException as e:
        logger.error(f"HF API Request failed: {e}")
        raise HTTPException(status_code=502, detail=f"Failed to communicate with AI provider: {str(e)}")
