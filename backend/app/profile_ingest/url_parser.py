import requests
from bs4 import BeautifulSoup
import logging
import re
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

def fetch_url_content(url: str) -> dict:
    """
    Fetches and cleans text content from a public URL.
    Returns a dict with 'raw_text' and 'source' metadata.
    """
    try:
        # 1. Validate URL
        result = urlparse(url)
        if not all([result.scheme, result.netloc]):
            raise ValueError("Invalid URL provided")

        # 2. Identify Source
        domain = result.netloc.lower()
        source = "generic"
        if "linkedin.com" in domain:
            source = "linkedin"
        elif "github.com" in domain:
            source = "github"
        elif "twitter.com" in domain or "x.com" in domain:
            source = "twitter"
        elif "medium.com" in domain or "dev.to" in domain:
            source = "blog"

        # 3. Fetch Content (Safe headers)
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        # 4. Parse & Clean HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove noise
        for element in soup(['script', 'style', 'nav', 'footer', 'header', 'iframe']):
            element.decompose()
            
        # Extract text
        text = soup.get_text(separator=' ')
        
        # Collapse whitespace
        clean_text = re.sub(r'\s+', ' ', text).strip()
        
        # 5. Check for Auth Walls / Login Screens / Empty Content
        auth_keywords = ["sign in", "join now", "join linkedin", "authwall", "challenge", "login"]
        lower_text = clean_text.lower()
        
        # If text is too short, it's likely a JS redirect or blocked page
        if len(clean_text) < 150:
             logger.warning(f"URL {url} returned insufficient content ({len(clean_text)} chars). Assuming blocked.")
             return {
                 "raw_profile_text": "AUTH_WALL_DETECTED",
                 "source": "auth_wall"
             }

        if any(k in lower_text[:500] for k in auth_keywords) and len(clean_text) < 2000:
             logger.warning(f"URL {url} appears to be behind an auth wall.")
             return {
                 "raw_profile_text": "AUTH_WALL_DETECTED",
                 "source": "auth_wall"
             }

        # Limit length for LLM safety (approx 6000 chars)
        safe_text = clean_text[:8000]

        logger.info(f"Fetched URL {url} ({source}). extracted {len(safe_text)} chars.")
        
        return {
            "raw_profile_text": safe_text,
            "source": source
        }

    except requests.RequestException as e:
        logger.error(f"Error fetching URL {url}: {e}")
        raise ValueError(f"Failed to fetch URL: {str(e)}")
    except Exception as e:
        logger.error(f"Error parsing URL {url}: {e}")
        raise ValueError(f"Processing error: {str(e)}")
