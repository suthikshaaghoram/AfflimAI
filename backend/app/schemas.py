from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, Literal

class ManifestationRequest(BaseModel):
    preferred_name: str = Field(..., description="You would like to be called as")
    birth_date: str = Field(..., description="Birth date")
    nakshatra: str = Field(..., description="Nakshatra (with Padam)")
    birth_time: str = Field(..., description="Birth Time")
    birth_place: str = Field(..., description="Birth Place")
    lagna: str = Field(..., description="Lagna")
    strengths: str = Field(..., description="Your strengths")
    areas_of_improvement: str = Field(..., description="Areas of improvement")
    greatest_achievement: str = Field(..., description="Greatest Achievement in life")
    recent_achievement: str = Field(..., description="Big achievement in last one year")
    next_year_goals: str = Field(..., description="Next one year goal (or goals)")
    life_goals: str = Field(..., description="Life Goal (or Goals) (with timeline)")
    legacy: str = Field(..., description="How you would like others to remember you")
    manifestation_focus: str = Field(..., description="One thing you want to manifest")
    generation_mode: Optional[Literal["quick", "deep"]] = Field(
        default="deep",
        description="Generation mode: 'quick' for ~2 min audio (200-250 words), 'deep' for ~4 min audio (≤500 words)"
    )

class ManifestationData(BaseModel):
    manifestation_text: str
    generation_mode: str = Field(..., description="Mode used for generation")
    word_count: int = Field(..., description="Actual word count")

class AudioRequest(BaseModel):
    text: str = Field(..., description="The text to convert to audio")
    gender: str = Field(..., description="Gender of the voice (male/female)")
    language: str = Field(default="en", description="Language code: en, ta (Tamil), hi (Hindi)")
    username: Optional[str] = Field(None, description="Username for file naming")
    voice_style: Optional[Literal["calm", "balanced", "uplifting"]] = Field(
        default="calm",
        description="Voice expression: 'calm' for meditation, 'balanced' for natural, 'uplifting' for motivation"
    )

class ManifestationResponse(BaseModel):
    status: str
    message: str
    data: ManifestationData

class TranslationRequest(BaseModel):
    text: str = Field(..., description="English manifestation text to translate")
    target_language: str = Field(..., description="Target language code (ta=Tamil, hi=Hindi)")
    username: Optional[str] = Field(None, description="Username for file naming and vector store")

class TranslationResponse(BaseModel):
    status: str
    language: str = Field(..., description="Full language name (e.g., 'Tamil')")
    language_code: str = Field(..., description="Language code (e.g., 'ta')")
    translated_text: str = Field(..., description="The translated manifestation text")

class VedicRequest(BaseModel):
    birthDate: str = Field(..., description="YYYY-MM-DD")
    birthTime: str = Field(..., description="HH:mm")
    birthPlace: str = Field(..., description="City, Country")

class VedicResponse(BaseModel):
    nakshatra: str
    lagna: str
    rasi: Optional[str] = None
    status: str


