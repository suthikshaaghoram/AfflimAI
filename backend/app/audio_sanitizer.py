"""
Audio Sanitization Layer.
Removes unwanted metadata, introductions, and system phrases from text
before it is sent to the TTS engine.
"""
import re
import logging

logger = logging.getLogger(__name__)

# Compile regex patterns for performance
# 1. Boilerplate Introductions
INTRO_PATTERNS = [
    r"^here is (your|the|a) (manifestation|translation|affirmation|generated audio)(?:\.+|:)?",
    r"^here is (the|your)?\s*generated audio for:?", # Catch "Here is the generated audio for"
    r"^(generated|created|audio) for:?",
    r"^manifestation (text|content):?",
    r"^translation (text|content|(for \w+)):?", # Added "(for \w+)" to catch "Translation for Tamil"
    r"^listening to:?",
    r"^(this|the) (affirmation|manifestation) says:?",
    r"^title:?",
    r"^subject:?",
    r"^topic:?",
]

# 2. Metadata lines (e.g., "(Voice: Calm)", "[Language: Tamil]")
# Limit length to avoid matching full content wrapped in brackets/tags (e.g. [slow]...[/slow])
METADATA_PATTERNS = [
    r"^\(.{1,100}\)$",  # Lines purely in parentheses (short)
    r"^\[.{1,100}\]$",  # Lines purely in brackets (short)
    r"^voice:.*",
    r"^language:.*",
    r"^mode:.*",
    r"^duration:.*",
]

# 3. Formatting artifacts (start of line)
FORMATTING_PREFIXES = [
    r"^[-*_]{3,}$", # Horizontal rules
    r"^[#]+ ",      # Markdown headers
    r"^[*\-+] ",    # List items (we might want to keep content, but usually lists in manifestation are bullet points which TTS handles okay, or they are meta lists)
]

def sanitize_for_tts(text: str) -> str:
    """
    Sanitize text to ensure only the manifestation content is spoken.
    
    Args:
        text (str): Raw input text.
        
    Returns:
        str: Cleaned text ready for TTS.
    """
    if not text:
        return ""

    logger.info("Sanitizing audio input...")
    input_text = text.strip()
    
    # Split into lines to process line-by-line
    lines = input_text.split('\n')
    cleaned_lines = []
    
    start_content_found = False
    
    for line in lines:
        stripped_line = line.strip()
        
        if not stripped_line:
            continue

        # Check for metadata or skip patterns
        should_skip = False
        
        # Check against metadata patterns (always remove these)
        for pattern in METADATA_PATTERNS:
            if re.search(pattern, stripped_line, re.IGNORECASE):
                logger.info(f"Stripping metadata line: '{stripped_line}'")
                should_skip = True
                break
        
        if should_skip:
            continue
            
        # Check against intro patterns (only remove if we haven't found content yet)
        if not start_content_found:
            is_intro = False
            for pattern in INTRO_PATTERNS:
                if re.search(pattern, stripped_line, re.IGNORECASE):
                    is_intro = True
                    logger.info(f"Stripping intro line: '{stripped_line}'")
                    break
            
            # Also strip markdown headers from the first line if it looks like a title
            # e.g. "# My Manifestation" -> skip
            # But "# I am powerful" -> keep (maybe?) -> Actually safely assume Headers are titles.
            if stripped_line.startswith('#'):
                 is_intro = True
                 logger.info(f"Stripping header line: '{stripped_line}'")

            if is_intro:
                continue
            
            # If we pass checks, this is likely our first real line
            start_content_found = True
        
        # Clean up formatting within the line
        # Remove markdown bold/italic markers but keep text
        clean_content = stripped_line.replace('**', '').replace('__', '').replace('*', '')
        
        # Remove leading list markers if they are just distracting for TTS?
        # Actually TTS handles "bullet... text" okay-ish, or just reads text.
        # Let's just strip leading "- " or "* " if present to make it cleaner.
        clean_content = re.sub(r"^[\-\*]\s+", "", clean_content)
        
        if clean_content:
            cleaned_lines.append(clean_content)

    result = " ".join(cleaned_lines)
    
    # Final check: Remove any leading "quote" marks/phrases that might have been inline
    # e.g. "Here is the text: 'I am powerful'" -> the loop removed "Here is..." but left "'I am powerful'"
    # We want to strip the specific leading quotes if they wrap the whole thing.
    
    # Simple strip of quotes if the whole thing is quoted
    if (result.startswith('"') and result.endswith('"')) or (result.startswith("'") and result.endswith("'")):
        result = result[1:-1].strip()

    logger.info(f"Sanitization complete. Input len: {len(text)}, Output len: {len(result)}")
    return result
