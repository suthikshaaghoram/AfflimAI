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
    if language == "en":
        # Full support for English
        
        # Whisper: Soft, quiet, intimate (Use x-soft for compatibility)
        text = re.sub(r'\[whisper\](.*?)\[/whisper\]', r'<prosody volume="x-soft" rate="-10%">\1</prosody>', text, flags=re.IGNORECASE | re.DOTALL)
        
        # Slow: Deep emphasis
        text = re.sub(r'\[slow\](.*?)\[/slow\]', r'<prosody rate="-15%" pitch="-5%">\1</prosody>', text, flags=re.IGNORECASE | re.DOTALL)
        
        # Smile: Warm, gentle positivity (Slight pitch lift)
        text = re.sub(r'\[smile\](.*?)\[/smile\]', r'<prosody pitch="+5%">\1</prosody>', text, flags=re.IGNORECASE | re.DOTALL)
        
        # Firm: Confidence & Authority (Louder -> loud)
        text = re.sub(r'\[firm\](.*?)\[/firm\]', r'<prosody volume="loud">\1</prosody>', text, flags=re.IGNORECASE | re.DOTALL)
        
        # Gentle: Safety & Comfort (Softer -> soft)
        text = re.sub(r'\[gentle\](.*?)\[/gentle\]', r'<prosody volume="soft" rate="-5%">\1</prosody>', text, flags=re.IGNORECASE | re.DOTALL)
        
        # Echo: Subconscious reinforcement (Simulated tail fade via slow rate)
        text = re.sub(r'\[echo\](.*?)\[/echo\]', r'<prosody rate="-20%">\1</prosody>', text, flags=re.IGNORECASE | re.DOTALL)
        
        # Rise: Emotional Uplift (Gradual lift)
        text = re.sub(r'\[rise\](.*?)\[/rise\]', r'<prosody pitch="+2%" rate="+5%">\1</prosody>', text, flags=re.IGNORECASE | re.DOTALL)
        
    else:
        # Safe Mode for Non-English: Strip tags, keep text
        # This prevents invalid SSML attributes for stricter voices
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
    
    sentences = re.split(r'(?<=[.!?])\s+', text)
    ssml_parts = []
    
    # ISO Lang Map
    lang_map = {"en": "en-US", "ta": "ta-IN", "hi": "hi-IN"}
    iso_lang = lang_map.get(language, "en-US")

    ssml_parts.append(f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="{iso_lang}">')
    ssml_parts.append(f'<voice name="{voice_name}">')
    
    for i, sentence in enumerate(sentences):
        sentence = sentence.strip()
        if not sentence: continue
        
        # 1. Escape XML
        safe_sentence = escape_ssml_text(sentence)
        
        # 2. Parse User Tags (creates <break> and <prosody>)
        tagged_sentence = parse_emotional_tags(safe_sentence, language)
        
        # 3. Flatten Logic: Split by <prosody ...>...</prosody>
        # This regex matches the full prosody block including content
        # Note: Non-greedy match .*? inside
        parts = re.split(r'(<prosody.*?>.*?</prosody>)', tagged_sentence, flags=re.DOTALL)
        
        for part in parts:
            if not part: continue
            
            # If it's a prosody block, add as is
            if part.startswith("<prosody"):
                ssml_parts.append(part)
            else:
                # It's plain text, wrap in base prosody
                # Only wrap if it contains something other than whitespace
                if part.strip():
                     ssml_parts.append(f"{base_prosody_start}{part}{base_prosody_end}")
                else:
                    ssml_parts.append(part) # preserve whitespace if any relevant
        
        # Add pause between sentences (outside prosody)
        # We can add this raw or inside base prosody? 
        # Breaks work better outside for timing accuracy.
        if i < len(sentences) - 1:
            if config["pause_strength"] == "strong":
                ssml_parts.append(" ") 
            else:
                ssml_parts.append(" ")

    ssml_parts.append('</voice>')
    ssml_parts.append('</speak>')
    
    return ''.join(ssml_parts)
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
