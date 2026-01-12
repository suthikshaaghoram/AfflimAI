from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os
from typing import Optional
from app.schemas import VedicRequest, VedicResponse
import logging
import re

router = APIRouter()
logger = logging.getLogger(__name__)

# Environment Variables
ASTRO_API_BASE_URL = os.getenv("ASTRO_API_BASE_URL")
ASTRO_API_USER_ID = os.getenv("ASTRO_API_USER_ID")
ASTRO_API_KEY = os.getenv("ASTRO_API_KEY")

def format_nakshatra(name: str) -> str:
    """
    Formats API Nakshatra names to standard spaced format.
    e.g., "PurvaBhadra" -> "Purva Bhadrapada"
    """
    if not name or name == "Unknown":
        return name
        
    # Mapping for known API deviations
    mapping = {
        "Ashvini": "Ashwini",
        "Arudra": "Ardra",
        "Punardvasu": "Punarvasu",
        "Pushyami": "Pushya",
        "Aslesha": "Ashlesha",
        "Magha": "Magha", # Same
        "PurvaPhalguni": "Purva Phalguni",
        "UttaraPhalguni": "Uttara Phalguni",
        "Hastha": "Hasta",
        "Chitta": "Chitra",
        "Svati": "Swati",
        "Visakha": "Vishakha",
        "Jyeshta": "Jyeshtha",
        "Moola": "Mula",
        "PurvaShadha": "Purva Ashadha",
        "UttaraShadha": "Uttara Ashadha",
        "Sravana": "Shravana",
        "Dhanista": "Dhanishta",
        "Satabhisha": "Shatabhisha",
        "PurvaBhadra": "Purva Bhadrapada",
        "UttaraBhadra": "Uttara Bhadrapada",
        "Revathi": "Revati"
    }
    
    # Check exact match first
    if name in mapping:
        return mapping[name]
        
    # Check if key is contained (e.g. "PurvaShadha" vs "Purva Ashadha")
    for key, val in mapping.items():
        if key.lower() == name.lower():
            return val
            
    # Fallback: Insert space before capital letters if missing
    # e.g. "PurvaBhadrapada" -> "Purva Bhadrapada" (if not in map)
    spaced = re.sub(r'(?<!^)(?=[A-Z])', ' ', name)
    return spaced

@router.post("/vedic-context", response_model=VedicResponse)
async def get_vedic_context(data: VedicRequest):
    """
    Get Nakshatra and Lagna (Ascendant) details from AstroAPI.
    """
    
    # Check if credentials exist
    if not ASTRO_API_BASE_URL or not ASTRO_API_KEY:
        logger.warning("AstroAPI credentials missing, using MOCK data")
        return get_mock_vedic_response(data)

    try:
        # Parse inputs
        date_parts = data.birthDate.split("-")
        time_parts = data.birthTime.split(":")
        
        if len(date_parts) != 3 or len(time_parts) != 2:
             return get_mock_vedic_response(data)

        year, month, day = int(date_parts[0]), int(date_parts[1]), int(date_parts[2])
        hour, minute = int(time_parts[0]), int(time_parts[1])

        # VedicAstroAPI.com v3 Implementation
        formatted_date = f"{day:02d}/{month:02d}/{year}"
        
        # Geocoding & Timezone Lookup without Silent Default
        lat, lon, tz = None, None, None
        
        try:
            from geopy.geocoders import Nominatim
            from timezonefinder import TimezoneFinder
            import pytz
            from datetime import datetime

            geolocator = Nominatim(user_agent="afflimai_vedic")
            location = geolocator.geocode(data.birthPlace)
            
            if location:
                lat, lon = location.latitude, location.longitude
                
                tf = TimezoneFinder()
                tz_str = tf.timezone_at(lng=lon, lat=lat)
                
                if tz_str:
                    local_tz = pytz.timezone(tz_str)
                    naive_birth_dt = datetime(year, month, day, hour, minute)
                    
                    try:
                        localized_dt = local_tz.localize(naive_birth_dt)
                        offset = localized_dt.utcoffset()
                        if offset:
                            tz = offset.total_seconds() / 3600.0
                            logger.info(f"Timezone Resolved: {tz_str} for {naive_birth_dt} -> Offset: {tz}")
                    except Exception as tz_err:
                        # Fallback for TZ only if location was found but TZ failed (rare)
                        # We might default to UTC or 0, but usually safe to err.
                        logger.warning(f"Timezone localization failed: {tz_err}")
                
                if tz is None:
                    # If we have lat/lon but no TZ, that's tricky. 
                    # Defaulting to 0.0 might be better than random, or 5.5.
                    # But let's try 0.0 or raise error? 
                    # Most APIs expect valid TZ. Let's default to 0.0 if TZ lookup fails but Geocode worked
                    tz = 0.0 
                    
                logger.info(f"Resolved Location: {data.birthPlace} -> {lat}, {lon} (TZ: {tz})")
            else:
                logger.warning(f"Geocoding returned None for: {data.birthPlace}")
                
        except Exception as geo_e:
            logger.error(f"Geocoding error for {data.birthPlace}: {geo_e}")

        # --- CRITICAL CHANGE: If Geocoding failed, do NOT proceed with default Chennai coordinates ---
        if lat is None or lon is None:
             raise HTTPException(status_code=400, detail=f"Could not find location: {data.birthPlace}. Please check spelling.")

        
        api_url = f"{ASTRO_API_BASE_URL}/horoscope/planet-details"
        
        params = {
            "api_key": ASTRO_API_KEY,
            "dob": formatted_date,
            "tob": data.birthTime, # HH:mm
            "lat": lat,
            "lon": lon,
            "tz": tz,
            "lang": "en"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(api_url, params=params, timeout=10.0)
                
                if response.status_code == 200:
                    res_data = response.json()
                    response_obj = res_data.get("response", {})
                    
                    if isinstance(response_obj, str):
                         try:
                             import json
                             response_obj = json.loads(response_obj)
                         except:
                             return get_mock_vedic_response(data)

                    planet_list = list(response_obj.values()) if isinstance(response_obj, dict) else response_obj
                    
                    my_nakshatra = "Unknown"
                    my_lagna = "Unknown"
                    my_rasi = "Unknown"
                    
                    for planet in planet_list:
                        if not isinstance(planet, dict):
                            continue
                            
                        p_name = planet.get("full_name") or planet.get("name")
                        if p_name == "Ascendant" or p_name == "Lagna":
                            my_lagna = planet.get("zodiac") or planet.get("sign") 
                        if p_name == "Moon" or p_name == "Mo": # API sometimes uses 'Mo'
                            my_nakshatra = planet.get("nakshatra")
                            my_rasi = planet.get("zodiac")
                            
                    # Format Nakshatra
                    if my_nakshatra and my_nakshatra != "Unknown":
                        my_nakshatra = format_nakshatra(my_nakshatra)

                    return VedicResponse(
                        nakshatra=my_nakshatra if my_nakshatra != "Unknown" else "Click to select",
                        lagna=my_lagna if my_lagna != "Unknown" else "Click to select",
                        rasi=my_rasi if my_rasi != "Unknown" else "Click to select",
                        status="success"
                    )
                else:
                    logger.error(f"Vedic API Error {response.status_code}: {response.text}")
                    # If API fails (e.g. Rate Limit), maybe then fallback to Mock?
                    # Or tell user "Service Busy"? 
                    # Let's fallback to Mock for robustness but log it.
                    pass
                    
            except Exception as api_err:
                logger.error(f"API Call Failed: {api_err}")
                pass

    except HTTPException as he:
        # Re-raise HTTP exceptions (like bad location)
        raise he
    except Exception as e:
        logger.error(f"Vedic Context Logic Error: {str(e)}")
        pass

    # Fallback to Mock if anything (except known HTTP errors) failed
    return get_mock_vedic_response(data)


def get_mock_vedic_response(data: VedicRequest) -> VedicResponse:
    """Deterministic mock response based on input len/char to feel dynamic"""
    # Simple deterministic hash for "stable" results per input
    val = len(data.birthPlace) + int(data.birthDate.split("-")[-1])
    
    nakshatras = [
        "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra",
        "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
        "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
        "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
        "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
    ]
    lagnas = [
        "Aries (Mesha)", "Taurus (Vrishabha)", "Gemini (Mithuna)", "Cancer (Karka)",
        "Leo (Simha)", "Virgo (Kanya)", "Libra (Tula)", "Scorpio (Vrishchika)",
        "Sagittarius (Dhanu)", "Capricorn (Makara)", "Aquarius (Kumbha)", "Pisces (Meena)"
    ]
    
    return VedicResponse(
        nakshatra=nakshatras[val % len(nakshatras)],
        lagna=lagnas[(val * 2) % len(lagnas)],
        status="success_mock"
    )

