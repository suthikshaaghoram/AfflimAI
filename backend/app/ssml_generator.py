"""
SSML generation for emotion-aware voice modulation.
Uses Microsoft SSML specification for Edge TTS.
"""
import re
from typing import List

# Voice style configurations
STYLE_CONFIG = {
    "calm": {
        "pitch": "-2%",      # Rounded from -1.5%
        "rate": "-8%",       
        "volume": "medium",
        "emphasis_level": "reduced",
        "pause_strength": "strong"
    },
    "balanced": {
        "pitch": "+1%",      # Rounded from +0.5%
        "rate": "-4%",       
        "volume": "medium",
        "emphasis_level": "moderate",
        "pause_strength": "medium"
    },
    "uplifting": {
        "pitch": "+2%",      # Rounded from +1.5%
        "rate": "0%",        
        "volume": "medium",
        "emphasis_level": "strong",
        "pause_strength": "medium"
    }
}

# Affirmational keywords that get emphasis (language-specific)
AFFIRMATION_KEYWORDS = {
    "en": [
        "achieve", "abundance", "confident", "manifest", "powerful", 
        "success", "grateful", "blessed", "thrive", "prosper", "wealth",
        "abundance", "confident", "strong", "capable", "worthy", "deserving",
        "attract", "create", "transform", "grow", "flourish"
    ],
    "ta": ["வெற்றி", "வளம்", "சக்தி", "நம்பிக்கை", "செழிப்பு"],  
    "hi": ["सफलता", "आत्मविश्वास", "शक्ति", "समृद्धि"]
}

def detect_affirmations(text: str, language: str) -> List[str]:
    """
    Detect affirmational words in text for context-aware emphasis.
    
    Args:
        text: Input text to analyze
        language: Language code
        
    Returns:
        List of found affirmational keywords
    """
    keywords = AFFIRMATION_KEYWORDS.get(language, AFFIRMATION_KEYWORDS["en"])
    found = []
    text_lower = text.lower()
    
    for keyword in keywords:
        if keyword.lower() in text_lower:
            found.append(keyword)
    
    return found

def escape_ssml_text(text: str) -> str:
    """
    Escape special XML characters for SSML.
    
    Args:
        text: Plain text
        
    Returns:
        SSML-safe text
    """
    text = text.replace("&", "&amp;")
    text = text.replace("<", "&lt;")
    text = text.replace(">", "&gt;")
    text = text.replace('"', "&quot;")
    text = text.replace("'", "&apos;")
    return text

def parse_emotional_tags(text: str, language: str = "en") -> str:
    """
    Parse custom emotional tags and replace them with SSML equivalents.
    Tags processed: [pause], [breathe], [still], [whisper], [slow], 
    [smile], [firm], [gentle], [echo], [rise]
    
    For non-English languages, complex prosody tags are stripped to prevent 
    TTS engine crashes (500 errors), as voices like 'PallaviNeural' 
    have stricter validation. Pauses are preserved.
    """
    # 1. Handle Pauses (Universal fallback to punctuation)
    text = re.sub(r'\[pause\]', '... ', text, flags=re.IGNORECASE)
    text = re.sub(r'\[breathe\]', '... . . ', text, flags=re.IGNORECASE)
    text = re.sub(r'\[still\]', '... ... ... ', text, flags=re.IGNORECASE)
    
    # 2. Handle Prosody Tags
    # NOTE: Complex prosody tags (whisper, slow, etc.) are causing 500 errors with Edge TTS
    # due to instability when switching prosody attributes mid-stream.
    # For now, we STRIP these tags to ensure stable audio generation.
    # We only preserve Pauses.
    
    # Strip tags for ALL languages (including English) for stability
    tags = ["whisper", "slow", "smile", "firm", "gentle", "echo", "rise"]
    for tag in tags:
        # Remove opening tag
        text = re.sub(rf'\[{tag}\]', '', text, flags=re.IGNORECASE)
        # Remove closing tag
        text = re.sub(rf'\[/{tag}\]', '', text, flags=re.IGNORECASE)
        
    return text
    
def apply_ssml_prosody(text: str, voice_style: str, language: str, voice_name: str) -> str:
    """
    Wrap text in SSML with prosody tags for emotional modulation.
    Avoids nested <prosody> tags by applying base style only to unwrapped segments.
    """
    config = STYLE_CONFIG.get(voice_style, STYLE_CONFIG["calm"])
    
    # Base prosody string
    # For non-English languages, skip global prosody to avoid crashes with leading punctuation
    if language == "en":
        base_prosody_start = f'<prosody pitch="{config["pitch"]}" rate="{config["rate"]}" volume="{config["volume"]}">'
        base_prosody_end = '</prosody>'
    else:
        base_prosody_start = ""
        base_prosody_end = ""
    
    ssml_parts = []
    
    # ISO Lang Map
    lang_map = {"en": "en-US", "ta": "ta-IN", "hi": "hi-IN"}
    iso_lang = lang_map.get(language, "en-US")

    # SIMPLIFIED ROBUST LOGIC:
    # Treat entire text as one block. No sentence splitting.
    # This avoids complex SSML structure issues with Edge TTS.
    
    # 1. Escape XML
    safe_text = escape_ssml_text(text)
    
    # 2. Parse User Tags (Stripped for stability, pauses mapped)
    tagged_text = parse_emotional_tags(safe_text, language)
    
    # 3. Global Wrapping
    ssml_parts.append(f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="{iso_lang}">')
    ssml_parts.append(f'<voice name="{voice_name}">')
    
    # Wrap in base prosody if defined
    if base_prosody_start:
        ssml_parts.append(f"{base_prosody_start}{tagged_text}{base_prosody_end}")
    else:
        ssml_parts.append(tagged_text)
        
    ssml_parts.append('</voice>')
    ssml_parts.append('</speak>')
    
    return ''.join(ssml_parts)
    
def generate_ssml(text: str, voice_style: str, language: str, voice_name: str) -> str:
    """
    Main entry point for SSML generation with emotion-aware prosody.
    
    Args:
        text: Plain manifestation text
        voice_style: Emotion mode ("calm", "balanced", "uplifting")
        language: Language code
        
    Returns:
        SSML-formatted text ready for Edge TTS
    """
    # Validate and normalize style
    if voice_style not in STYLE_CONFIG:
        voice_style = "calm"
    
    ssml = apply_ssml_prosody(text, voice_style, language, voice_name)
    print(f"DEBUG SSML PAYLOAD:\n{ssml}\nEND PAYLOAD")
    return ssml
