"""
SSML generation for emotion-aware voice modulation.
Uses Microsoft SSML specification for Edge TTS.
"""
import re
from typing import List

# Voice style configurations
STYLE_CONFIG = {
    "calm": {
        "pitch": "-5%",      # Slightly lower for soothing effect
        "rate": "-15%",      # Slower for meditation
        "volume": "medium",
        "emphasis_level": "reduced",
        "pause_strength": "strong"
    },
    "balanced": {
        "pitch": "0%",       # Neutral
        "rate": "-10%",      # Natural conversational
        "volume": "medium",
        "emphasis_level": "moderate",
        "pause_strength": "medium"
    },
    "uplifting": {
        "pitch": "+3%",      # Slightly higher for energy
        "rate": "-5%",       # A bit faster but controlled
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

def apply_ssml_prosody(text: str, voice_style: str, language: str, voice_name: str) -> str:
    """
    Wrap text in SSML with prosody tags for emotional modulation.
    
    Args:
        text: Plain text to convert
        voice_style: "calm", "balanced", or "uplifting"
        language: Language code for context-aware processing
        voice_name: Specific voice model name (required for SSML)
        
    Returns:
        SSML-formatted text with prosody tags
    """
    config = STYLE_CONFIG.get(voice_style, STYLE_CONFIG["calm"])
    
    # Split into sentences (preserve structure)
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    # Build SSML
    ssml_parts = []

    # Map language code to ISO format
    lang_map = {
        "en": "en-US", 
        "ta": "ta-IN", 
        "hi": "hi-IN"
    }
    iso_lang = lang_map.get(language, "en-US")

    ssml_parts.append(f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="{iso_lang}">')
    
    # Wrap in voice tag
    ssml_parts.append(f'<voice name="{voice_name}">')
    
    # Apply global prosody
    ssml_parts.append(
        f'<prosody pitch="{config["pitch"]}" rate="{config["rate"]}" volume="{config["volume"]}">'
    )
    
    # Process sentences
    for i, sentence in enumerate(sentences):
        sentence = sentence.strip()
        if not sentence:
            continue
        
        # Escape XML characters
        safe_sentence = escape_ssml_text(sentence)
        
        # Check for affirmational words
        affirmations = detect_affirmations(sentence, language)
        
        # Add emphasis to affirmational sentences in balanced/uplifting modes
        content = safe_sentence
        # Emphasis tag causing issues with Edge TTS. Disabled for stability.
        # if affirmations and voice_style in ["balanced", "uplifting"]:
        #    content = f'<emphasis level="{config["emphasis_level"]}">{safe_sentence}</emphasis>'
        
        ssml_parts.append(content)
        
        # Add pause after sentence using standard punctuation/ellipsis instead of <break>
        # <break> tag is currently causing NoAudioReceived errors.
        if i < len(sentences) - 1:
            # Add ellipsis for longer pause if strong, else just space (sentence has its own period usually)
            if config["pause_strength"] == "strong":
                ssml_parts.append("... ") 
            else:
                ssml_parts.append(" ")
    
    ssml_parts.append('</prosody>')
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
    
    return apply_ssml_prosody(text, voice_style, language, voice_name)
