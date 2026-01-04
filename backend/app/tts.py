import edge_tts
import edge_tts.communicate
import uuid
import os
from .ssml_generator import generate_ssml
from .audio_sanitizer import sanitize_for_tts 

# Monkeypatch edge_tts to allow raw SSML input
# This is necessary because edge_tts >= 7.2.7 forces text escaping in Communicate.__init__
# and does not provide an option to pass raw SSML.
def patched_mkssml(tc, text):
    return text

# Disable escaping to preserve XML tags
edge_tts.communicate.escape = lambda x: x

# Disable default SSML wrapping
edge_tts.communicate.mkssml = patched_mkssml

# Disable splitting to prevent breaking XML tags in the middle
# (Assuming the payload is within reasonable limits, e.g. < 10 mins text)
edge_tts.communicate.split_text_by_byte_length = lambda text, limit: [text]


async def generate_audio_file(
    text: str, 
    gender: str, 
    language: str = "en",
    filename: str = None, 
    voice_style: str = "calm"
) -> str:
    """
    Generates audio with emotion-aware voice modulation using SSML.
    
    Args:
        text (str): The text to speak.
        gender (str): 'male' or 'female'.
        language (str): Language code - 'en', 'ta' (Tamil), 'hi' (Hindi)
        filename (str, optional): Custom filename. If provided, saves to 'outputs/'.
        voice_style (str): Voice expression - 'calm', 'balanced', 'uplifting' (default: 'calm')
    
    Returns:
        str: Path to the generated audio file
    """
    # Sanitize input text (remove intros, metadata, system phrases)
    clean_text = sanitize_for_tts(text)

    # Voice selection based on language and gender
    voice_map = {
        # English (Indian accent)
        "en": {
            "male": "en-IN-PrabhatNeural",
            "female": "en-IN-NeerjaNeural"
        },
        # Tamil
        "ta": {
            "male": "ta-IN-ValluvarNeural",
            "female": "ta-IN-PallaviNeural"
        },
        # Hindi
        "hi": {
            "male": "hi-IN-MadhurNeural",
            "female": "hi-IN-SwaraNeural"
        }
    }
    
    # Get voice for selected language and gender
    language_voices = voice_map.get(language, voice_map["en"])
    voice = language_voices.get(gender.lower(), language_voices["female"])
    
    # Generate SSML with emotion-aware prosody
    ssml_text = generate_ssml(clean_text, voice_style, language, voice)
    
    # Clean SSML
    final_ssml = ssml_text.strip().lstrip('\ufeff')
    print(f"DEBUG SSML PAYLOAD:\n{final_ssml}\nEND PAYLOAD")

    # Create communicate object with SSML
    # Note: rate is now handled in SSML prosody, not as a parameter
    communicate = edge_tts.Communicate(final_ssml, voice)
    
    if filename:
        # Persistent Output
        output_dir = "outputs"
        final_filename = f"{filename}.mp3"
    else:
        # Temporary Output
        output_dir = "temp_audio"
        final_filename = f"{uuid.uuid4()}.mp3"
        
    os.makedirs(output_dir, exist_ok=True)
    file_path = os.path.join(output_dir, final_filename)
    
    await communicate.save(file_path)
    
    return file_path
