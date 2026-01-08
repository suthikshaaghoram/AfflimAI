import logging
import json
from app.hf_client import generate_text
from app.schemas import ManifestationRequest

logger = logging.getLogger(__name__)

SUMMARIZATION_PROMPT = """You are an intelligent data-alignment and profile-understanding engine.

Your task:
Given RAW, UNSTRUCTURED LINKEDIN-SCRAPED TEXT, extract, infer, and map the information into the predefined AfflimAI form fields.

CRITICAL RULES (NON-NEGOTIABLE):
1. **NO PRONOUNS**: Do NOT use "I", "Me", "My", "We", "Our", or "You".
2. **OBJECTIVE STYLE**: Start sentences directly with the action verb or noun.
3. **EXTREMELY CONCISE**:
   - MAX 8 WORDS per text field.
   - MAX 3 ITEMS for list fields (comma-separated).
4. NEVER hallucinate or guess private or astrological data.
5. If a field is not explicitly or reasonably inferable, return null.

-----------------------------------
FIELDS TO POPULATE
-----------------------------------

Personal Details:
- preferred_name (string | null) -> Extract first name only.

Vedic Astrology Context:
- nakshatra_with_pada (null only) -> Always null
- lagna_ascendant (null only) -> Always null
- birth_place (null only) -> Always null
- birth_date (null only) -> Always null
- birth_time (null only) -> Always null

Personal Profile (STRICT: MAX 8 WORDS / 3 ITEMS):
- strengths (string | null) -> Top 3 skills only (e.g., "Leadership, Python, Strategic Planning").
- areas_of_growth (string | null) -> Top 1 focus (e.g., "Expanding AI knowledge").
- greatest_achievement (string | null) -> The single most impressive feat (e.g., "Led team to launch Global App").
- recent_win (string | null) -> One specific recent milestone (e.g., "Completed Data Science Certification").

Dreams & Vision (STRICT: MAX 8 WORDS):
- next_year_goals (string | null) -> One main objective (e.g., "Secure Senior Engineer role").
- life_goals_with_timeline (string | null) -> Ultimate career/life aim (e.g., "Become CTO of tech firm").
- legacy (string | null) -> Core impact statement (e.g., "Empowering women in tech").
- manifestation_focus (string | null) -> 2-4 word theme (e.g., "Global Impact Leader").

-----------------------------------
OUTPUT FORMAT (STRICT)
-----------------------------------

Return ONLY valid JSON.
Do NOT include explanations or markdown.
JSON Structure:
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

-----------------------------------
INPUT
-----------------------------------
{profile_text}
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
