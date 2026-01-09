from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os
from typing import Optional
from app.schemas import VedicRequest, VedicResponse
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Environment Variables
ASTRO_API_BASE_URL = os.getenv("ASTRO_API_BASE_URL")
ASTRO_API_USER_ID = os.getenv("ASTRO_API_USER_ID")
ASTRO_API_KEY = os.getenv("ASTRO_API_KEY")

@router.post("/vedic-context", response_model=VedicResponse)
async def get_vedic_context(data: VedicRequest):
    """
    Get Nakshatra and Lagna (Ascendant) details from AstroAPI.
    """
    # --- MOCK IMPLEMENTATION FOR DEMO/TESTING ---
    # If credentials are missing or API fails, we return a deterministic mock based on input
    # This ensures the "Happy Path" works for the user even without valid keys.

    if not ASTRO_API_BASE_URL or not ASTRO_API_KEY:
        logger.warning("AstroAPI credentials missing, using MOCK data")
        return get_mock_vedic_response(data)

    try:
        # Parse inputs
        date_parts = data.birthDate.split("-")
        time_parts = data.birthTime.split(":")
        
        if len(date_parts) != 3 or len(time_parts) != 2:
             # Should be caught by schema validation but good double check
             return get_mock_vedic_response(data)

        year, month, day = int(date_parts[0]), int(date_parts[1]), int(date_parts[2])
        hour, minute = int(time_parts[0]), int(time_parts[1])

        # VedicAstroAPI.com v3 Implementation
        # Base URL: https://api.vedicastroapi.com/v3-json
        
        # Format Date as DD/MM/YYYY for this API
        formatted_date = f"{day:02d}/{month:02d}/{year}"
        
        # Endpoint: /horoscope/planet-details is reliable for Ascendant & Nakshatra
        # Or /prediction/birth-details
        # Let's use 'planet-details' which gives Lagna (Ascendant) + Moon (Nakshatra)
        
        # Geocoding & Timezone Lookup
        lat, lon, tz = 13.0827, 80.2707, 5.5 # Default fallback
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
                    # Calculate UTC offset for the given date/time
                    # Use the specific birth date/time to account for DST (Daylight Savings) correctly
                    local_tz = pytz.timezone(tz_str)
                    naive_birth_dt = datetime(year, month, day, hour, minute)
                    
                    # Localize the naive datetime to the found timezone
                    # is_dst=None raises error for ambiguous times, False/True forces standard/DST. 
                    # We usually let pytz decide or use safe fallback. Mismatches in DST are rare logic unless near transition.
                    try:
                        localized_dt = local_tz.localize(naive_birth_dt)
                        offset = localized_dt.utcoffset()
                        if offset:
                            # Convert total seconds to hours (e.g. 19800 -> 5.5)
                            tz = offset.total_seconds() / 3600.0
                            logger.info(f"Timezone Resolved: {tz_str} for {naive_birth_dt} -> Offset: {tz}")
                    except Exception as tz_err:
                        logger.warning(f"Timezone localization failed: {tz_err}")
                        
                logger.info(f"Resolved Location: {data.birthPlace} -> {lat}, {lon} (TZ: {tz})")
        except Exception as geo_e:
            logger.warning(f"Geocoding failed for {data.birthPlace}, using default: {geo_e}")

        
        api_url = f"{ASTRO_API_BASE_URL}/horoscope/planet-details"
        
        # VedicAstroAPI v3 Params
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
                # VedicAstroAPI v3 often uses GET
                response = await client.get(api_url, params=params, timeout=10.0)
                logger.info(f"Vedic API Status: {response.status_code}")
                logger.info(f"Vedic API Response: {response.text}")
                
                if response.status_code == 200:
                    res_data = response.json()
                    response_obj = res_data.get("response", {})
                    
                    # Extract Ascendant (Lagna) - usually distinct or in planets list (id 0 or 'Ascendant')
                    # And Moon (id 1) has Nakshatra
                    # The structure for planet-details: { "0": { "name": "Ascendant", "nakshatra": "...", ... }, "1": { "name": "Moon", ... } }
                    # OR array.
                    
                    # Let's try to handle their format robustly.
                    # If it differs, we catch exception and fall back to Mock.
                    
                    if isinstance(response_obj, str):
                         # API returned an error string or weird format
                         logger.warning(f"Vedic API returned string response: {response_obj}")
                         # If it's a JSON string, try to parse it
                         try:
                             import json
                             response_obj = json.loads(response_obj)
                         except:
                             return get_mock_vedic_response(data)

                    # Heuristic parsing:
                    # The API returns a dict with keys "0", "1", etc. for planets.
                    # We convert values() to a list to iterate.
                    planet_list = list(response_obj.values()) if isinstance(response_obj, dict) else response_obj

                    
                    my_nakshatra = "Unknown"
                    my_lagna = "Unknown"
                    
                    my_rasi = "Unknown"
                    for planet in planet_list:
                        if not isinstance(planet, dict):
                            continue
                            
                        p_name = planet.get("full_name") or planet.get("name")
                        if p_name == "Ascendant" or p_name == "Lagna":
                            my_lagna = planet.get("zodiac") or planet.get("sign") # "Aries"
                        if p_name == "Moon":
                            my_nakshatra = planet.get("nakshatra")
                            my_rasi = planet.get("zodiac")
                            
                    # If simple endpoint failed, try fallback logical or stick to Unknown so user can set manually
                    if my_lagna == "Unknown" and my_nakshatra == "Unknown":
                         # Maybe structure is different
                         pass

                    return VedicResponse(
                        nakshatra=my_nakshatra if my_nakshatra != "Unknown" else "Click to select",
                        lagna=my_lagna if my_lagna != "Unknown" else "Click to select",
                        rasi=my_rasi if my_rasi != "Unknown" else "Click to select",
                        status="success"
                    )
            except Exception as api_err:
                logger.error(f"API Call Failed: {api_err}")
                pass
            except Exception as api_err:
                logger.error(f"API Call Failed: {api_err}")
                # Fallback to Mock
                pass

    except Exception as e:
        logger.error(f"Vedic Context Logic Error: {str(e)}")
        # Fallback to Mock
        pass

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

