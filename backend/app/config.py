import os
from pydantic_settings import BaseSettings
from pydantic import ValidationError

class Settings(BaseSettings):
    HUGGINGFACE_API_KEY: str
    MODEL_ID: str = "HuggingFaceH4/zephyr-7b-beta"
    EMBEDDING_MODEL: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    CHROMA_DB_PATH: str = "./chroma_db"
    
    # New Provider Settings (Optional)
    GROQ_API_KEY: str = ""  # Optional, but needed for Groq
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gemma3:1b"
    
    DEEPSEEK_API_KEY: str = "" # Optional
    
    class Config:
        env_file = ".env"
        extra = "ignore"

try:
    settings = Settings()
except ValidationError as e:
    print("Error: Missing required environment variables.")
    print(e)
    # In a real app, you might want to exit here or handle it more gracefully
    # For now, we'll let it fail if imported and variable is missing
    raise
