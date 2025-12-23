import requests
import json
import os
import time

API_BASE = "http://127.0.0.1:8000/api/v1"

def test_flow():
    # 1. Generate Manifestation
    print("\n[1] Generating Manifestation...")
    
    # Using hardcoded payload to verify schema matches Frontend
    payload = {
      "preferred_name": "Alex",
      "birth_date": "1995-05-20",
      "birth_time": "10:30",
      "birth_place": "Chennai",
      "nakshatra": "Rohini",
      "lagna": "Taurus",
      "strengths": "Resilience, Empathy",
      "areas_of_improvement": "Patience",
      "greatest_achievement": "Graduating with honors",
      "recent_achievement": "Learning to code",
      "next_year_goals": "Build a SaaS",
      "life_goals": "Financial Freedom",
      "legacy": "Kindness",
      "manifestation_focus": "Inner peace and rapid career growth"
    }
        
    username = payload["preferred_name"]
    
    try:
        r = requests.post(f"{API_BASE}/generate-manifestation", json=payload)
        r.raise_for_status()
        data = r.json()
        manifestation_text = data["data"]["manifestation_text"]
        print("Success! Generated text length:", len(manifestation_text))
        
        # Verify text persistence
        # We need to find the latest file in outputs matching the pattern
        time.sleep(1) # Ensure FS update
        files = sorted([f for f in os.listdir("outputs") if f.endswith(".txt")], key=lambda x: os.path.getctime(os.path.join("outputs", x)))
        if files and username.replace(" ", "_") in files[-1]:
             print(f"Verified persistence: outputs/{files[-1]} exists.")
        else:
             print("WARNING: Text file persistence not found immediately.")
             
    except Exception as e:
        print(f"Error generating manifestation: {e}")
        return

    # 2. Generate Audio
    print("\n[2] Generating Audio (Slower Rate)...")
    audio_payload = {
        "text": manifestation_text,
        "gender": "female",
        "username": username
    }
    
    try:
        r = requests.post(f"{API_BASE}/generate-audio", json=audio_payload)
        r.raise_for_status()
        
        # Determine expected filename from header or guess
        content_disposition = r.headers.get("content-disposition", "")
        print(f"Audio Generated. Content-Disposition: {content_disposition}")
        
        # Verify audio persistence
        time.sleep(2)
        files = sorted([f for f in os.listdir("outputs") if f.endswith(".mp3")], key=lambda x: os.path.getctime(os.path.join("outputs", x)))
        if files and username.replace(" ", "_") in files[-1]:
             latest_audio = os.path.join("outputs", files[-1])
             size_mb = os.path.getsize(latest_audio) / (1024 * 1024)
             print(f"Verified persistence: {latest_audio} exists.")
             print(f"File Size: {size_mb:.2f} MB")
        else:
             print("WARNING: Audio file persistence not found.")

    except Exception as e:
        print(f"Error generating audio: {e}")

if __name__ == "__main__":
    test_flow()
