import edge_tts
import uuid
import os

async def generate_audio_file(
    text: str, 
    gender: str, 
    language: str = "en",
    filename: str = None, 
    rate: str = "-10%"
) -> str:
    """
    Generates an audio file from text using edge-tts.
    Supports multiple languages: English, Tamil, Hindi.
    
    Args:
        text (str): The text to speak.
        gender (str): 'male' or 'female'.
        language (str): Language code - 'en', 'ta' (Tamil), 'hi' (Hindi)
        filename (str, optional): Custom filename. If provided, saves to 'outputs/'.
        rate (str): Speaking rate adjustment (default '-10%').
    
    Returns:
        str: Path to the generated audio file
    """
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
    
    # Using rate adjustment for duration
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    
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
