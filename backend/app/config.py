import os
from pydantic_settings import BaseSettings
from pydantic import ValidationError

class Settings(BaseSettings):
    HUGGINGFACE_API_KEY: str
    MODEL_ID: str = "HuggingFaceH4/zephyr-7b-beta"
    EMBEDDING_MODEL: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    CHROMA_DB_PATH: str = "./chroma_db"
    
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
