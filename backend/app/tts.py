import edge_tts
import uuid
import os

async def generate_audio_file(text: str, gender: str, filename: str = None, rate: str = "-10%") -> str:
    """
    Generates an audio file from text using edge-tts.
    Returns the path to the generated file.
    
    Args:
        text (str): The text to speak.
        gender (str): 'male' or 'female'.
        filename (str, optional): Custom filename. If provided, saves to 'outputs/'.
        rate (str): Speaking rate adjustment (default '-10%').
        pitch (str): Pitch adjustment (default '-2Hz') for warmer tone.
    """
    # Select voice based on gender
    # User requested "only indian tamil accent more human like voice".
    # en-IN-PrabhatNeural and en-IN-NeerjaNeural are high quality Indian English voices.
    # If specifically "Tamil accent" is needed for English, ta-IN/ta-SG voices can be used,
    # but en-IN is safer for English text. Given the user's "more human like" request,
    # we will use the expressive Indian English voices.
    if gender.lower() == "male":
        voice = "en-IN-PrabhatNeural" 
    else:
        voice = "en-IN-NeerjaNeural"
    
    # Using rate adjustment for duration, but no pitch adjustment to ensure stability
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
