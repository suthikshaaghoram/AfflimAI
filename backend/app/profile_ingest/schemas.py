from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ProfileParseRequest(BaseModel):
    linkedin_url: Optional[str] = Field(None, description="Public LinkedIn Profile URL")
    github_url: Optional[str] = Field(None, description="GitHub Profile URL")
    portfolio_url: Optional[str] = Field(None, description="Portfolio or Personal Website URL")
    profile_text: Optional[str] = Field(None, description="Manual copy-paste of profile text")

class ProfileParseResponse(BaseModel):
    status: str
    raw_profile_text: str
    source: str
    char_count: int

class ProfileSummarizeRequest(BaseModel):
    raw_profile_text: str = Field(..., description="Raw text extracted from profile")
    source: str = Field(default="generic", description="Source of the text (linkedin, github, etc)")

class ProfileSummarizeResponse(BaseModel):
    status: str
    manifestation_data: Dict[str, Any] = Field(..., description="Data mapped to ManifestationRequest schema")
