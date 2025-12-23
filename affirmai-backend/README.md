# AffirmAI Backend

AffirmAI is a robust, modular, and production-ready backend for generating personalized manifestation passages using AI. It utilizes FastAPI, Pydantic, and the Hugging Face Inference API.

## Project Structure

```
affirmai-backend/
├── app/
│   ├── main.py              # FastAPI Application Entry Point
│   ├── routes.py            # API Endpoints
│   ├── schemas.py           # Pydantic Data Models
│   ├── prompt.py            # Prompt Engineering Logic
│   ├── hf_client.py         # Hugging Face API Client
│   └── config.py            # Configuration Management
├── api/                     # API Namespace (Future Use)
├── .env                     # Environment Variables
├── requirements.txt         # Project Dependencies
└── README.md                # Documentation
```

## Setup & Installation

1. **Prerequisites**: Python 3.10+ installed.

2. **Clone/Navigate**:
   ```bash
   cd affirmai-backend
   ```

3. **Virtual Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Environment Configuration**:
   - Create a `.env` file in the root directory (copy from example or create new).
   - Add your Hugging Face API Token:
     ```env
     HUGGINGFACE_API_KEY=hf_your_actual_token_here
     MODEL_ID=mistralai/Mistral-7B-Instruct-v0.2
     ```

## Running the Application

Start the development server with hot-reload:
```bash
uvicorn app.main:app --reload
```

Server will be accessible at: `http://127.0.0.1:8000`

## API Documentation

- **Swagger UI**: Visit `http://127.0.0.1:8000/docs` to explore and test endpoints interactively.
- **ReDoc**: Visit `http://127.0.0.1:8000/redoc` for alternative documentation.

### Generate Manifestation Endpoint

**POST** `/generate-manifestation`

**Request Body** (Example):
```json
{
  "preferred_name": "Alex",
  "birth_date": "1998-05-21",
  "star_sign": "Gemini",
  "strengths": "Adaptability, Communication",
  "areas_of_improvement": "Focus",
  "greatest_achievement": "Graduated with Honors",
  "recent_achievement": "Promoted to Senior Dev",
  "next_year_goals": "Master AI Engineering",
  "life_goals": "Build a tech startup",
  "legacy": "Innovation in Education",
  "manifestation_focus": "Career Growth"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Manifestation generated successfully",
  "data": {
    "manifestation_text": "Alex, you stand at the threshold of greatness..."
  }
}
```

## Architecture Notes

- **Modular Design**: Each component (routes, logic, config) is separated for maintainability.
- **Error Handling**: Graceful handling of API timeouts and failures.
- **Validation**: Strict input validation using Pydantic.
