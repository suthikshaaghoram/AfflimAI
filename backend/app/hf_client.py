import logging
import re # Ensure re is imported
from .config import settings
from fastapi import HTTPException
from .llm_providers import provider_manager

logger = logging.getLogger(__name__)

def generate_text(prompt: str, system_prompt: str = "You are a helpful assistant.") -> str:
    """
    Generate text using robust multi-provider failover.
    Attempts: Novita -> Groq -> Ollama.
    """
    try:
        content = provider_manager.generate_text_with_fallback(prompt, system_prompt)
        
        # Post-processing to extract <manifestation> tags if present
        # This logic was in the original hf_client, preserving it.
        match = re.search(r'<manifestation>(.*?)</manifestation>', content, re.DOTALL)
        if match:
            content = match.group(1).strip()
        else:
            # Fallback cleanup
            content = content.replace("Here is your manifestation:", "").replace("Here is the manifestation:", "")
            content = content.replace("<manifestation>", "").replace("</manifestation>", "")
            content = content.strip()
            
        # Remove newlines and ensure single spacing
        return content.replace('\n', ' ').strip()

    except Exception as e:
        logger.error(f"All AI Providers failed: {e}")
        raise HTTPException(status_code=502, detail=f"Translation Service Unavailable: {str(e)}")
