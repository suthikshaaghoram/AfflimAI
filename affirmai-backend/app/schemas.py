from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

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

class ManifestationData(BaseModel):
    manifestation_text: str

class ManifestationResponse(BaseModel):
    status: str
    message: str
    data: ManifestationData
