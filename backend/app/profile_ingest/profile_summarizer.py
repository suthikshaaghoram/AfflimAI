import logging
import json
from app.hf_client import generate_text
from app.schemas import ManifestationRequest

logger = logging.getLogger(__name__)

SUMMARIZATION_PROMPT = """You are an expert career profiler and psychologist. 
Your task is to analyze a raw professional profile (e.g., from LinkedIn or GitHub) and extract specific psychological and professional insights to build a "Manifestation Profile".

INPUT PROFILE TEXT:
{profile_text}

CRITICAL INSTRUCTIONS:
1. IGNORE navigation text (e.g., "Sign In", "Skip to content", "Followers", "Repositories", "Pricing", "Patrons").
2. Focus ONLY on the biographical and professional description found in the text.
3. If the text only contains navigation links or generic platform messages, return generic positive placeholders instead of hallucinating specific companies or roles.
4. BE CONCISE. 1-2 sentences maximum per field.

TASK:
Extract/Infer the following fields based on the profile content.
Return the result as a STRICT JSON object.

FIELDS TO EXTRACT:
1. "preferred_name": The user's full name or preferred name found in the profile.
2. "strengths": Key professional and soft skills (comma separated).
3. "areas_of_improvement": Potential growth areas based on career gaps or typical challenges in their role (infer if not explicit).
4. "greatest_achievement": The most significant role, project, or award found.
5. "recent_achievement": A recent position or accomplishment (last 1-2 years).
6. "next_year_goals": Logical next career step (e.g., Promotion to Senior X, Leading a team).
7. "life_goals": Long-term career trajectory logic (e.g., "Become a C-level executive", "Start a consultancy").
8. "legacy": What professional impact they seem to be building towards.
9. "manifestation_focus": A high-level theme for their career right now (e.g., "Leadership and Impact", "Financial Abundance", "Creative Freedom").

JSON OUTPUT STRUCTURE:
{{
    "preferred_name": "...",
    "strengths": "...",
    "areas_of_improvement": "...",
    "greatest_achievement": "...",
    "recent_achievement": "...",
    "next_year_goals": "...",
    "life_goals": "...",
    "legacy": "...",
    "manifestation_focus": "..."
}}

Ensure the tone is professional, encouraging, and accurate to the input.
"""

def summarize_profile(profile_text: str) -> dict:
    """
    Uses LLM to summarize raw profile text into manifestation data schema.
    """
    # Truncate text if too long (approx 3000 chars should be enough for context)
    truncated_text = profile_text[:6000]
    
    if "AUTH_WALL_DETECTED" in profile_text:
        return {
            "strengths": "Profile Not Accessible",
            "preferred_name": "",
            "areas_of_improvement": "Please upload a PDF",
            "greatest_achievement": "We could not read this URL directly.",
            "recent_achievement": "Social platforms often block automated readers.",
            "next_year_goals": "Use the PDF Upload option for best results.",
            "life_goals": "Ensures 100% accuracy.",
            "legacy": "Your privacy is protected.",
            "manifestation_focus": "Try Uploading PDF"
        }
    
    prompt = SUMMARIZATION_PROMPT.format(profile_text=truncated_text)
    
    try:
        # Use existing LLM client
        response_text = generate_text(prompt)
        
        # Robust JSON Extraction
        import re
        # Find the first opening brace and last closing brace
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        
        if json_match:
            clean_json = json_match.group(0)
            data = json.loads(clean_json)
            return data
        else:
            # Fallback: Try removing markdown if regex failed (rare)
            clean_json = response_text.replace("```json", "").replace("```", "").strip()
            data = json.loads(clean_json)
            return data
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON Parse Error in summarization: {e}. Text: {response_text}")
        # Fallback empty structure
        return {
            "preferred_name": "",
            "strengths": "Adaptability, Professionalism",
            "areas_of_improvement": "Advanced Leadership",
            "greatest_achievement": "Building a successful career foundation",
            "recent_achievement": "Continuing professional growth",
            "next_year_goals": "Career advancement and new opportunities",
            "life_goals": "Achieving professional excellence and balance",
            "legacy": "Making a meaningful contribution to the field",
            "manifestation_focus": "Career Growth and Stability"
        }
    except Exception as e:
        logger.error(f"Summarization failed: {e}")
        raise e
