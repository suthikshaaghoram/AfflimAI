# API Reference Documentation

## Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Generate Manifestation](#generate-manifestation)
  - [Translate Manifestation](#translate-manifestation)
  - [Get Supported Languages](#get-supported-languages)
  - [Generate Audio](#generate-audio)
  - [Get Last Submission](#get-last-submission)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Base URL

**Development**: `http://localhost:8000`  
**Production**: `https://your-domain.com` (configure as needed)

All API endpoints are prefixed with `/api/v1/` for versioning.

---

## Authentication

> [!NOTE]
> **Current Status**: No authentication required
> 
> The current implementation does not require authentication. For production deployment, consider implementing:
> - JWT-based authentication
> - API key authentication
> - OAuth 2.0 integration

---

## Endpoints

### Health Check

Check if the API server is running.

**Endpoint**: `GET /`

**Response**:
```json
{
  "message": "AffirmAI Backend is running. Visit /docs for API documentation."
}
```

**Status Codes**:
- `200 OK`: Server is healthy

---

### Generate Manifestation

Generate a personalized manifestation passage based on user input.

**Endpoint**: `POST /api/v1/generate-manifestation`

**Request Body**:

```json
{
  "preferred_name": "string",
  "birth_date": "string (YYYY-MM-DD)",
  "nakshatra": "string",
  "birth_time": "string (HH:MM)",
  "birth_place": "string",
  "lagna": "string",
  "strengths": "string",
  "areas_of_improvement": "string",
  "greatest_achievement": "string",
  "recent_achievement": "string",
  "next_year_goals": "string",
  "life_goals": "string",
  "legacy": "string",
  "manifestation_focus": "string"
}
```

**Request Example**:

```bash
curl -X POST http://localhost:8000/api/v1/generate-manifestation \
  -H "Content-Type: application/json" \
  -d '{
    "preferred_name": "Rajesh",
    "birth_date": "1990-05-15",
    "nakshatra": "Ashwini",
    "birth_time": "06:30",
    "birth_place": "Chennai",
    "lagna": "Aries",
    "strengths": "Leadership, Innovation, Communication",
    "areas_of_improvement": "Patience, Time Management",
    "greatest_achievement": "Built successful startup",
    "recent_achievement": "Raised Series A funding",
    "next_year_goals": "Expand to 10 cities, Revenue 10Cr",
    "life_goals": "Create sustainable business ecosystem",
    "legacy": "Mentor next generation entrepreneurs",
    "manifestation_focus": "Abundance and Growth"
  }'
```

**Response**:

```json
{
  "status": "success",
  "message": "Manifestation generated successfully",
  "data": {
    "manifestation_text": "I am Rajesh, born under the dynamic and pioneering influence of Ashwini Nakshatra, with Aries as my Lagna. My cosmic blueprint is one of initiation, swift action, and healing energy...\n\n[~500 words of personalized manifestation]"
  }
}
```

**Status Codes**:
- `200 OK`: Manifestation generated successfully
- `400 Bad Request`: Invalid input data
- `500 Internal Server Error`: Generation failed

**Side Effects**:
- Saves manifestation to `outputs/{username}_{timestamp}.txt`
- Saves form data to `outputs/last_submission.json` (for auto-fill)

---

### Translate Manifestation

Translate an English manifestation to Tamil or Hindi using RAG-based translation.

**Endpoint**: `POST /api/v1/translate-manifestation`

**Request Body**:

```json
{
  "text": "string (manifestation text to translate)",
  "target_language": "string (ta|hi)",
  "username": "string (optional)"
}
```

**Supported Languages**:
- `ta`: Tamil (தமிழ்)
- `hi`: Hindi (हिन्दी)

**Request Example**:

```bash
curl -X POST http://localhost:8000/api/v1/translate-manifestation \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I am a powerful manifestor. I attract abundance and success into my life.",
    "target_language": "ta",
    "username": "Rajesh"
  }'
```

**Response**:

```json
{
  "status": "success",
  "language": "Tamil",
  "language_code": "ta",
  "translated_text": "நான் ஒரு சக்திவாய்ந்த வெளிப்படுத்துபவர். என் வாழ்க்கையில் செழிப்பையும் வெற்றியையும் ஈர்க்கிறேன்."
}
```

**Status Codes**:
- `200 OK`: Translation successful
- `400 Bad Request`: Unsupported language or invalid input
- `500 Internal Server Error`: Translation failed

**Performance**:
- **First translation**: 30-40 seconds (full RAG pipeline)
- **Cached translation**: 5-8 seconds (embeddings cached)

**Side Effects**:
- Saves translation to `outputs/{username}_{lang_code}_{timestamp}.txt`
- Stores embeddings and translations in ChromaDB vector store
- Updates embedding cache for faster future translations

---

### Get Supported Languages

Get metadata about all supported translation languages.

**Endpoint**: `GET /api/v1/supported-languages`

**Request Example**:

```bash
curl http://localhost:8000/api/v1/supported-languages
```

**Response**:

```json
{
  "status": "success",
  "languages": {
    "ta": {
      "name": "Tamil",
      "native_name": "தமிழ்",
      "code": "ta"
    },
    "hi": {
      "name": "Hindi",
      "native_name": "हिन्दी",
      "code": "hi"
    }
  }
}
```

**Status Codes**:
- `200 OK`: Languages retrieved successfully

---

### Generate Audio

Convert text to speech in multiple languages with native voices.

**Endpoint**: `POST /api/v1/generate-audio`

**Request Body**:

```json
{
  "text": "string (text to convert to speech)",
  "gender": "string (male|female)",
  "language": "string (en|ta|hi)",
  "username": "string (optional)"
}
```

**Voice Options**:

| Language | Code | Male Voice | Female Voice |
|----------|------|------------|--------------|
| English | `en` | `en-IN-PrabhatNeural` | `en-IN-NeerjaNeural` |
| Tamil | `ta` | `ta-IN-ValluvarNeural` | `ta-IN-PallaviNeural` |
| Hindi | `hi` | `hi-IN-MadhurNeural` | `hi-IN-SwaraNeural` |

**Request Example**:

```bash
curl -X POST http://localhost:8000/api/v1/generate-audio \
  -H "Content-Type: application/json" \
  -d '{
    "text": "நான் ஒரு சக்திவாய்ந்த வெளிப்படுத்துபவர்.",
    "gender": "female",
    "language": "ta",
    "username": "Rajesh"
  }' \
  --output manifestation.mp3
```

**Response**:
- **Content-Type**: `audio/mpeg`
- **Body**: Binary MP3 file
- **Filename**: `{username}_{language}_{timestamp}.mp3` (if username provided)

**Status Codes**:
- `200 OK`: Audio generated successfully (binary MP3 response)
- `400 Bad Request`: Invalid input
- `500 Internal Server Error`: Audio generation failed

**Side Effects**:
- Saves audio to `outputs/{username}_{lang_code}_{timestamp}.mp3` (if username provided)
- Temporary files cleaned up after response (if no username)

**Audio Characteristics**:
- **Format**: MP3
- **Duration**: ~5 minutes for 500-word manifestation
- **Speaking Rate**: Adjusted for natural listening

---

### Get Last Submission

Retrieve the last manifestation form submission data for auto-filling.

**Endpoint**: `GET /api/v1/last-submission`

**Request Example**:

```bash
curl http://localhost:8000/api/v1/last-submission
```

**Response**:

```json
{
  "preferred_name": "Rajesh",
  "birth_date": "1990-05-15",
  "nakshatra": "Ashwini",
  "birth_time": "06:30",
  "birth_place": "Chennai",
  "lagna": "Aries",
  "strengths": "Leadership, Innovation",
  "areas_of_improvement": "Patience",
  "greatest_achievement": "Built successful startup",
  "recent_achievement": "Raised Series A",
  "next_year_goals": "Expand to 10 cities",
  "life_goals": "Create sustainable business",
  "legacy": "Mentor entrepreneurs",
  "manifestation_focus": "Abundance"
}
```

**Status Codes**:
- `200 OK`: Last submission found
- `404 Not Found`: No previous submission exists
- `500 Internal Server Error`: Failed to read data

**Use Case**:
- Auto-fill form for returning users
- Quick re-generation with minor edits
- Saves time for frequent users

---

## Data Models

### ManifestationRequest

```typescript
{
  preferred_name: string;        // User's preferred name
  birth_date: string;            // Format: YYYY-MM-DD
  nakshatra: string;             // Vedic birth star
  birth_time: string;            // Format: HH:MM
  birth_place: string;           // City/location
  lagna: string;                 // Ascendant sign
  strengths: string;             // User's strengths
  areas_of_improvement: string;  // Areas to improve
  greatest_achievement: string;  // Biggest achievement
  recent_achievement: string;    // Recent win
  next_year_goals: string;       // Short-term goals
  life_goals: string;            // Long-term vision
  legacy: string;                // Desired legacy
  manifestation_focus: string;   // Focus area
}
```

### ManifestationResponse

```typescript
{
  status: "success" | "error";
  message: string;
  data: {
    manifestation_text: string;  // Generated 500-word passage
  }
}
```

### TranslationRequest

```typescript
{
  text: string;            // English text to translate
  target_language: "ta" | "hi";  // Target language code
  username?: string;       // Optional username for storage
}
```

### TranslationResponse

```typescript
{
  status: "success";
  language: string;        // Language name (e.g., "Tamil")
  language_code: string;   // Language code (e.g., "ta")
  translated_text: string; // Translated content
}
```

### AudioRequest

```typescript
{
  text: string;                   // Text to speak
  gender: "male" | "female";      // Voice gender
  language: "en" | "ta" | "hi";   // Audio language
  username?: string;              // Optional username
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Error Scenarios

#### 1. **Invalid Input (400)**

**Example**:
```json
{
  "detail": "Unsupported language: fr. Supported: ta, hi"
}
```

**Causes**:
- Invalid language code
- Missing required fields
- Malformed data

#### 2. **Not Found (404)**

**Example**:
```json
{
  "detail": "No previous submission found"
}
```

**Causes**:
- Requesting last submission when none exists
- Invalid resource ID

#### 3. **Internal Server Error (500)**

**Example**:
```json
{
  "detail": "Translation failed: Connection timeout"
}
```

**Causes**:
- Hugging Face API failure
- ChromaDB connection issues
- Edge TTS service unavailable
- File system errors

### Error Handling Best Practices

1. **Check status codes** before processing responses
2. **Parse error messages** for user-friendly display
3. **Implement retry logic** for transient failures
4. **Log errors** for debugging
5. **Provide fallbacks** where possible

---

## Rate Limiting

> [!WARNING]
> **Production Consideration**
> 
> The current implementation does not enforce rate limiting. For production:
> - Implement per-IP rate limiting
> - Set per-user quotas
> - Add queue management for expensive operations
> - Consider using Redis for distributed rate limiting

### Resource Intensity

| Endpoint | Avg Duration | Resource Usage | Recommended Limit |
|----------|--------------|----------------|------------------|
| `/generate-manifestation` | 5-10s | High (HF API) | 10/min per user |
| `/translate-manifestation` | 5-40s | Very High (RAG) | 5/min per user |
| `/generate-audio` | 3-8s | Medium (TTS) | 20/min per user |
| `/last-submission` | <100ms | Low | 100/min per user |
| `/supported-languages` | <10ms | Minimal | 1000/min |

---

## Interactive API Documentation

### Swagger UI

Access interactive API documentation at:

**URL**: `http://localhost:8000/docs`

Features:
- Try all endpoints directly
- See request/response schemas
- View example payloads
- Test with your own data

### ReDoc

Alternative documentation interface:

**URL**: `http://localhost:8000/redoc`

Features:
- Clean, readable format
- Searchable documentation
- Detailed descriptions
- Schema visualization

---

## Code Examples

### Python Example

```python
import requests

# Base URL
BASE_URL = "http://localhost:8000/api/v1"

# 1. Generate manifestation
response = requests.post(
    f"{BASE_URL}/generate-manifestation",
    json={
        "preferred_name": "Priya",
        "birth_date": "1995-08-20",
        "nakshatra": "Rohini",
        # ... other fields
        "manifestation_focus": "Peace and Harmony"
    }
)
manifestation = response.json()["data"]["manifestation_text"]
print(f"Generated: {manifestation[:100]}...")

# 2. Translate to Tamil
response = requests.post(
    f"{BASE_URL}/translate-manifestation",
    json={
        "text": manifestation,
        "target_language": "ta",
        "username": "Priya"
    }
)
translation = response.json()["translated_text"]
print(f"Tamil: {translation[:100]}...")

# 3. Generate audio
response = requests.post(
    f"{BASE_URL}/generate-audio",
    json={
        "text": translation,
        "gender": "female",
        "language": "ta",
        "username": "Priya"
    }
)
with open("manifestation_ta.mp3", "wb") as f:
    f.write(response.content)
print("Audio saved!")
```

### JavaScript/TypeScript Example

```typescript
const BASE_URL = "http://localhost:8000/api/v1";

// 1. Generate manifestation
const manifestationResponse = await fetch(
  `${BASE_URL}/generate-manifestation`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      preferred_name: "Arjun",
      birth_date: "1992-12-10",
      nakshatra: "Pushya",
      // ... other fields
      manifestation_focus: "Success and Prosperity"
    })
  }
);
const { data } = await manifestationResponse.json();
const manifestation = data.manifestation_text;

// 2. Translate to Hindi
const translationResponse = await fetch(
  `${BASE_URL}/translate-manifestation`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: manifestation,
      target_language: "hi",
      username: "Arjun"
    })
  }
);
const { translated_text } = await translationResponse.json();

// 3. Generate audio
const audioResponse = await fetch(
  `${BASE_URL}/generate-audio`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: translated_text,
      gender: "male",
      language: "hi",
      username: "Arjun"
    })
  }
);
const audioBlob = await audioResponse.blob();
const audioUrl = URL.createObjectURL(audioBlob);
// Play or download audio
```

### cURL Examples

```bash
# Generate manifestation
curl -X POST http://localhost:8000/api/v1/generate-manifestation \
  -H "Content-Type: application/json" \
  -d @manifestation_request.json

# Translate
curl -X POST http://localhost:8000/api/v1/translate-manifestation \
  -H "Content-Type: application/json" \
  -d '{"text":"...","target_language":"ta","username":"User"}'

# Generate audio
curl -X POST http://localhost:8000/api/v1/generate-audio \
  -H "Content-Type: application/json" \
  -d '{"text":"...","gender":"female","language":"en"}' \
  --output audio.mp3

# Get last submission
curl http://localhost:8000/api/v1/last-submission

# Get supported languages
curl http://localhost:8000/api/v1/supported-languages
```

---

## API Versioning

The API uses URL-based versioning with the `/api/v1/` prefix.

**Current Version**: v1

**Future Versions**:
- Backward compatibility will be maintained within v1
- Breaking changes will result in a new version (v2)
- Old versions will be deprecated with advance notice

---

## Changelog

### v1.0.0 (Current)
- ✅ Manifestation generation
- ✅ RAG-based translation (Tamil, Hindi)
- ✅ Multi-language audio (en, ta, hi)
- ✅ Auto-fill with last submission
- ✅ Language metadata endpoint

---

*Last Updated: January 2, 2026*
