# ✨ AffirmAI - AI-Powered Multi-Language Manifestation Generator

**AffirmAI** is an advanced AI-powered personalized manifestation generator that blends ancient astrological wisdom with modern psychology and cutting-edge AI technology. It generates customized manifestation passages in multiple languages, translates them with cultural sensitivity using RAG (Retrieval-Augmented Generation), and converts them into soothing audio with native voices.

---

## 🎯 Scope & Benefits

### **Scope**
AffirmAI combines four powerful domains:
1. **Astrology**: Analyzes user birth details (Nakshatra, Lagna) to align manifestations with cosmic energy.
2. **Psychology**: Incorporates user-defined strengths, weaknesses, and life goals for psychologically resonant content.
3. **Artificial Intelligence**: Utilizes advanced LLMs (DeepSeek-V3) to synthesize data into unique, poetic narratives.
4. **Multi-Language Support**: RAG-based translation system with ChromaDB for consistent, culturally-appropriate translations.

### **Benefits**
- **Deep Personalization**: Every passage is unique to the user's life path and astrological blueprint.
- **Multi-Language Experience**: Access your manifestations in English, Tamil (தமிழ்), and Hindi (हिन्दी).
- **Native Audio**: High-quality Text-to-Speech with native voices for each language.
- **Enhanced Focus**: Articulate specific goals and visualize your desired future with clarity.
- **Mental Well-being**: Promote positive self-talk and resilience through tailored affirmations.
- **Translation Memory**: Consistent translations powered by vector database and RAG.

---

## 🚀 Features

### Core Features
- ✅ **Personalized Manifestations**: Generates unique affirmations based on comprehensive user inputs
- ✅ **Astrological Integration**: Incorporates Nakshatra and Lagna traits
- ✅ **AI-Powered Generation**: Uses **DeepSeek-V3** via Hugging Face

### Multi-Language Features ⭐ NEW
- ✅ **RAG-Based Translation**: Translate manifestations to Tamil and Hindi with context-aware accuracy
- ✅ **Translation Memory**: ChromaDB vector database ensures consistent terminology
- ✅ **Multi-Language Audio**: Generate audio in English, Tamil, or Hindi with native voices
- ✅ **Dynamic Language Selector**: Only shows languages that have been translated
- ✅ **Semantic Chunking**: Intelligent text chunking for better translation quality

### Audio Features
- ✅ **Multi-Language TTS**: Native voices for each language
  - **English**: Indian-accented voices (Prabhat/Neerja)
  - **Tamil**: Tamil native voices (Valluvar/Pallavi)
  - **Hindi**: Hindi native voices (Madhur/Swara)
- ✅ **Gender Options**: Male and Female voices for each language
- ✅ **Auto-Fill**: Quick form filling with last submission data

### Performance Features
- ✅ **Embedding Cache**: 90% faster repeat translations
- ✅ **Persistent Storage**: Saves manifestations and translations
- ✅ **Modern UI**: Beautiful, responsive interface

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS with custom animations
- **UI**: Radix UI components, Lucide icons
- **Forms**: React Hook Form + Zod validation
- **State**: TanStack Query, Sonner toasts

### **Backend**
- **Framework**: FastAPI (Python 3.11+)
- **Server**: Uvicorn (ASGI)
- **AI/ML**:
  - **LLM**: DeepSeek-V3 (Hugging Face API)
  - **Embeddings**: sentence-transformers (MiniLM-L12-v2)
  - **Vector DB**: ChromaDB (persistent storage)
- **TTS**: edge-tts (Microsoft Edge TTS)
- **NLP**: NLTK (semantic chunking)

---

## 📂 Project Structure

```
AfflimAI/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── config.py            # Configuration
│   │   ├── schemas.py           # Pydantic models
│   │   ├── prompt.py            # Manifestation prompts
│   │   ├── hf_client.py         # Hugging Face API client
│   │   ├── tts.py               # Multi-language TTS
│   │   ├── embeddings.py        # Multilingual embeddings
│   │   ├── chunker.py           # Semantic text chunking
│   │   ├── vector_store.py      # ChromaDB integration
│   │   ├── rag_translate.py     # RAG translation pipeline
│   │   └── cache.py             # Embedding cache system
│   ├── api/
│   │   └── v1/
│   │       ├── router.py
│   │       └── endpoints/
│   │           ├── manifestation.py
│   │           ├── translation.py    # NEW
│   │           └── tts.py
│   ├── outputs/                 # Generated files
│   ├── chroma_db/              # Vector database
│   └── cache/                   # Embedding cache
└── frontend/
    └── src/
        ├── components/          # React components
        ├── pages/              # Page views
        └── lib/                # Utilities & API
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js** v18+
- **Python** 3.10+
- **Hugging Face API Token** ([Get one free](https://huggingface.co/settings/tokens))

### 1️⃣ Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download NLTK data
python3 -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab')"

# Create .env file
echo "HUGGINGFACE_API_KEY=your_token_here" > .env
echo "MODEL_ID=deepseek-ai/DeepSeek-V3" >> .env

# Start server
uvicorn app.main:app --reload
```

Server: `http://localhost:8000`  
API Docs: `http://localhost:8000/docs`

### 2️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend: `http://localhost:8080`

---

## 📖 Usage Guide

### Generate Manifestation
1. Open `http://localhost:8080`
2. Fill in your details (Name, Birth Info, Goals, etc.)
3. Click **"Generate My Manifestation"**
4. Review your personalized manifestation

### Translate to Other Languages
1. After generation, scroll to **"Translate to Your Language"** section
2. Click **Tamil (தமிழ்)** or **Hindi (हिन्दी)** button
3. Wait for translation (~30-40s first time, ~5-8s with cache)
4. View translated text

### Generate Audio
1. Scroll to **"Listen to Your Manifestation"** section
2. Select language: **English**, **Tamil**, or **Hindi** (only if translated)
3. Choose voice: **Male** or **Female**
4. Click to generate and play audio

---

## � API Reference

### 1. Generate Manifestation
**Endpoint**: `POST /api/v1/generate-manifestation`

**Request**:
```json
{
  "preferred_name": "Karthik",
  "birth_date": "1995-03-15",
  "nakshatra": "Rohini",
  "birth_time": "10:30",
  "birth_place": "Mumbai",
  "lagna": "Taurus",
  "strengths": "Leadership, Communication",
  "areas_of_improvement": "Time Management",
  "greatest_achievement": "Started Own Business",
  "recent_achievement": "Team Expansion",
  "next_year_goals": "Revenue Growth",
  "life_goals": "Build Sustainable Company",
  "legacy": "Create Jobs",
  "manifestation_focus": "Abundance"
}
```

**Response**: JSON with `manifestation_text`

### 2. Translate Manifestation ⭐ NEW
**Endpoint**: `POST /api/v1/translate-manifestation`

**Request**:
```json
{
  "text": "Your manifestation text...",
  "target_language": "ta",  // "ta" for Tamil, "hi" for Hindi
  "username": "Karthik"
}
```

**Response**: 
```json
{
  "status": "success",
  "language": "Tamil",
  "language_code": "ta",
  "translated_text": "உங்கள் வெளிப்பாடு உரை..."
}
```

### 3. Get Supported Languages
**Endpoint**: `GET /api/v1/supported-languages`

**Response**:
```json
{
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

### 4. Generate Audio ⭐ UPDATED
**Endpoint**: `POST /api/v1/generate-audio`

**Request**:
```json
{
  "text": "Your text to speak...",
  "gender": "female",      // "male" or "female"
  "language": "ta",        // "en", "ta", "hi"
  "username": "Karthik"
}
```

**Response**: Binary MP3 file

**Available Voices**:
- English: `en-IN-PrabhatNeural` (M), `en-IN-NeerjaNeural` (F)
- Tamil: `ta-IN-ValluvarNeural` (M), `ta-IN-PallaviNeural` (F)
- Hindi: `hi-IN-MadhurNeural` (M), `hi-IN-SwaraNeural` (F)

### 5. Auto-Fill Last Data
**Endpoint**: `GET /api/v1/last-submission`

**Response**: Last user's submission data for quick form filling

---

## 🔍 RAG Translation System

### How It Works

```
┌─────────────────────────────────────────────────────┐
│  1. Semantic Chunking (4-6 chunks)                  │
│     ↓                                                │
│  2. Generate Embeddings (384-dim vectors)           │
│     ↓                                                │
│  3. Store in ChromaDB + Vector Search               │
│     ↓                                                │
│  4. Retrieve Similar Context (RAG)                  │
│     ↓                                                │
│  5. LLM Translation (with context & examples)       │
│     ↓                                                │
│  6. Store Translation (Translation Memory)          │
└─────────────────────────────────────────────────────┘
```

### Benefits
- **Consistent Terminology**: Same phrases = Same translations
- **Context-Aware**: Uses past translations as examples
- **Cultural Adaptation**: Natural, emotionally resonant translations
- **Performance**: Embedding cache speeds up repeat translations by 90%

---

## 📊 Performance

### Translation Speed
- **First Translation**: 30-40 seconds (full pipeline)
- **Cached Translation**: 5-8 seconds (embeddings cached)
- **Optimization**: Semantic chunking reduces API calls by 60%

### Cache Statistics
- Embedding cache hit rate: >80% for repeat content
- Cache size: ~1.5KB per text
- Storage: Persistent across restarts

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Translation fails** | Check Hugging Face API token, ensure internet connection |
| **Audio not generating** | Verify edge-tts is installed: `pip install --upgrade edge-tts` |
| **CORS errors** | Ensure backend runs on port 8000, frontend on 8080 |
| **Slow translations** | First run downloads models (~500MB). Subsequent runs use cache |
| **ChromaDB errors** | Delete `chroma_db/` folder and restart server |

---

## 📅 Changelog

### December 30, 2025 - Major Update

#### ⭐ New Features
1. **Multi-Language Audio Support**
   - Generate audio in English, Tamil, and Hindi
   - Native voice support for each language (male/female)
   - Dynamic language selector (only shows translated languages)

2. **RAG-Based Translation System**
   - ChromaDB vector database for translation memory
   - Semantic chunking for better quality
   - Context-aware translations with past examples

3. **Performance Optimization**
   - Embedding cache system (90% faster repeat translations)
   - Persistent cache storage
   - Optimized chunking strategy

#### 🔧 Technical Improvements
- Added 6 new backend modules (cache, chunker, embeddings, vector_store, rag_translate, translation)
- Enhanced TTS module with multi-language support
- Updated API schemas for language parameters
- Improved frontend state management for translations

#### 📝 Documentation
- Comprehensive development log
- RAG & Vector DB explanation
- API testing results
- Git commit guide

#### 🐛 Bug Fixes
- Fixed UI crash after "This looks perfect" button
- Fixed language buttons showing before translation
- Fixed audio generation with language parameter

**Stats**: 16 files changed, 1,304 insertions, ~400 new lines of code

---

## 👨‍💻 Development

### Running Tests
```bash
# Test backend API
curl http://localhost:8000/

# Test translation endpoint
curl -X POST http://localhost:8000/api/v1/translate-manifestation \
  -H "Content-Type: application/json" \
  -d '{"text": "You are powerful", "target_language": "ta"}'

# Test audio
curl -X POST http://localhost:8000/api/v1/generate-audio \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "gender": "female", "language": "en"}' \
  --output test.mp3
```

### Project Commands
```bash
# Backend
cd backend
uvicorn app.main:app --reload          # Run dev server
python -m pytest                        # Run tests

# Frontend  
cd frontend
npm run dev                             # Run dev server
npm run build                           # Build for production
npm run preview                         # Preview production build
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is for personal use and educational purposes.

---

## 🙏 Acknowledgments

- **DeepSeek** for the powerful V3 model
- **Hugging Face** for API infrastructure
- **Microsoft Edge TTS** for high-quality voices
- **ChromaDB** for vector database
- **Sentence Transformers** for embeddings

---

*Made with ❤️ and positive intentions by Suthikshaa Ghoram*

**Last Updated**: December 30, 2025
