# AffirmAI Backend 🌟

AffirmAI is a high-performance, modular backend designed to generate deeply personalized manifestation passages and convert them into natural-sounding audio with a specific Indian Tamil accent context.

Built with **FastAPI**, **Pydantic**, **Hugging Face (DeepSeek)**, and **Edge-TTS**, it serves as a robust engine for affirmation and manifestation applications.

## 🚀 Features

-   **Deeply Personalized AI Generation**: Uses **DeepSeek-V3.2** (via OpenAI-compatible router) to craft 500-word manifestation passages based on detailed Vedic astrology and personal profile data.
-   **Vedic Astrology Integration**: Accepts specific inputs like *Nakshatra*, *Lagna*, *Birth Time*, and *Place* for context-aware generation.
-   **Natural Text-to-Speech (TTS)**:
    -   Generates high-quality audio using **Singapore Tamil** neural voices (`ta-SG-AnbuNeural`/`VenbaNeural`) which offer the best balance of authentic accent and English prosody.
    -   **Meditative Pacing**: Speech rate is tuned to **-10%** to ensure a calm, 5-minute duration experience.
-   **Persistence**: Automatically saves all text and audio generations to a sorted `outputs/` directory with timestamped filenames (`Username_YYYYMMDD_HHMMSS`).
-   **Modular Architecture**: Clean separation of concerns (API versioning, Logic, Config, Schemas).
-   **Production Ready**: Robust error handling, logging, and environment configuration.

---

## 🛠️ Tech Stack

-   **Framework**: Python 3.10+, FastAPI, Uvicorn
-   **Validation**: Pydantic
-   **AI Model**: `deepseek-ai/DeepSeek-V3.2` (via Hugging Face Router)
-   **TTS Engine**: `edge-tts` (Microsoft Edge Online TTS)
-   **Utilities**: `python-dotenv`, `requests`

---

## 📂 Project Structure

```bash
affirmai-backend/
├── api/
│   └── v1/
│       ├── router.py            # Main Router v1
│       └── endpoints/
│           ├── manifestation.py # Text Generation Endpoint
│           └── tts.py           # Audio Generation Endpoint
├── app/
│   ├── main.py                  # App Entry Point
│   ├── config.py                # Env & Settings
│   ├── schemas.py               # Pydantic Models (Request/Response)
│   ├── prompt.py                # Prompt Engineering
│   ├── hf_client.py             # DeepSeek/HF Client
│   └── tts.py                   # TTS Logic & Edge-TTS Wrapper
├── outputs/                     # Persistent Storage (Generated .txt & .mp3)
├── .env                         # Secrets (API Keys)
├── requirements.txt             # Dependencies
└── README.md                    # Documentation
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
-   Python 3.10 or higher
-   A Hugging Face Account & API Token (Free Tier works)

### 2. Clone & Install
```bash
git clone https://github.com/suthikshaaghoram/AfflimAI.git
cd affirmai-backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration
Create a `.env` file in the root directory:
```env
# Your Hugging Face User Access Token (Read permissions)
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxx

# Model ID (Verified working with Router)
MODEL_ID=deepseek-ai/DeepSeek-V3.2
```

---

## 🏃 Running the Application

Start the server using Uvicorn (with hot-reload enabled for development):
```bash
uvicorn app.main:app --reload
```

-   **API Base**: `http://127.0.0.1:8000`
-   **Swagger Docs**: `http://127.0.0.1:8000/docs`
-   **ReDoc**: `http://127.0.0.1:8000/redoc`

---

## 📖 API Documentation

### 1. Generate Manifestation
Generates a personalized text passage.

-   **Endpoint**: `POST /api/v1/generate-manifestation`
-   **Input**:
    ```json
    {
      "preferred_name": "Jordan",
      "birth_date": "1994-06-15",
      "nakshatra": "Mrigashirsha (Pada 4)",
      "birth_time": "14:30",
      "birth_place": "Chennai",
      "lagna": "Leo",
      "strengths": "Creativity, Adaptability",
      "areas_of_improvement": "Procrastination",
      "greatest_achievement": "Community Art Program",
      "recent_achievement": "Half Marathon",
      "next_year_goals": "UX Design Job",
      "life_goals": "Creative Studio",
      "legacy": "Accessibility in Art",
      "manifestation_focus": "Confidence"
    }
    ```
-   **Output**: JSON containing the generated text.
-   **Side Effect**: Saves text to `outputs/Jordan_YYYYMMDD_HHMMSS.txt`.

### 2. Generate Audio (TTS)
Converts text to speech using the configured voice models.

-   **Endpoint**: `POST /api/v1/generate-audio`
-   **Input**:
    ```json
    {
      "text": "Jordan, you stand in a moment of... [Full Text]",
      "gender": "female",
      "username": "Jordan"
    }
    ```
    -   `gender`: `"male"` (uses `ta-SG-AnbuNeural`) or `"female"` (uses `ta-SG-VenbaNeural`).
    -   `username`: Used to name the persistent file.
-   **Output**: Downloadable `.mp3` file.
-   **Side Effect**: Saves audio to `outputs/Jordan_YYYYMMDD_HHMMSS.mp3`.

---

## 🧪 Testing

You can test the full flow using the provided script:
```bash
python3 test_full_flow.py
```
This script will:
1.  Read `test_request.json`.
2.  Call the Manifestation API.
3.  Call the TTS API with the generated text.
4.  Verify that files are created in `outputs/`.

---

## 🐛 Troubleshooting

| Error | Cause | Solution |
| :--- | :--- | :--- |
| **410 Gone / 404 Not Found** | Old Hugging Face Inference API URL | Backend is updated to use `router.huggingface.co`. Ensure you have the latest code. |
| **500 Internal Error (TTS)** | Voice not found or rate limiting | Check `app/tts.py`. Ensure valid voices (`ta-SG-...`) are used. Invalid pitch/rate params can also cause this. |
| **Address already in use** | Uvicorn is already running | Run `pkill -f uvicorn` or close the other terminal tab. |
| **ModuleNotFoundError** | Running from wrong directory | Run `uvicorn` from the `affirmai-backend` root folder. |

---

## 📜 License
This project is proprietary software for AffirmAI.
