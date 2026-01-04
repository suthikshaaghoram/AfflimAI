# ✨ AfflimAI - AI-Powered Multi-Language Manifestation Generator

**AfflimAI** is an advanced AI-powered personalized manifestation generator that blends ancient astrological wisdom with modern psychology and cutting-edge AI technology. It generates customized manifestation passages in multiple languages, translates them with cultural sensitivity using RAG (Retrieval-Augmented Generation), and converts them into soothing audio with native voices.

## 📑 Table of Contents

- [Scope & Benefits](#-scope--benefits)
- [Features](#-features)
- [Technology Stack](#️-technology-stack)
- [Quick Start](#-quick-start-guide)
- [Usage](#-usage-guide)
- [API Reference](#-api-reference)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [Changelog](#-changelog)
- [License](#-license)

---

## 🎯 Scope & Benefits

### **Scope**
AfflimAI combines four powerful domains:
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

> 📖 For detailed architecture documentation, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

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

## 🔗 API Reference

> 📖 **Complete API Documentation**: See [docs/API_REFERENCE.md](./docs/API_REFERENCE.md) for detailed endpoint documentation with code examples in Python, JavaScript, and cURL.

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

> 📖 **Deep Dive**: For comprehensive RAG system documentation, see [docs/RAG_SYSTEM.md](./docs/RAG_SYSTEM.md)

### Quick Overview

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

### January 4, 2026 - Audio Generation Quality & SSML Fixes

#### 🔊 Audio Engine Overhaul
1.  **SSML Logic Refactor** (`app/ssml_generator.py`)
    -   **Problem**: Strict SSML tags (`<break>`, `<emphasis>`) caused `NoAudioReceived` errors with Edge TTS, especially for non-English languages like Tamil.
    -   **Fix**:
        -   **Natural Pausing**: Replaced explicit `<break time="..."/>` tags with natural punctuation (ellipses `...`, periods `.` ) which neural voices interpret natively for realistic pausing.
        -   **Emotion Handling**: Disabled explicit `<emphasis>` tags. Enabled the neural engine's native intonation capabilities to handle emotion naturally based on text context.
        -   **Standard Compliance**: Removed `mstts` namespace and fixed `xml:lang` attributes to ensure perfect compatibility with standard SSML parsers.

2.  **Audio Sanitization** (`app/audio_sanitizer.py`)
    -   **Problem**: Generated audio included meta-text like "Here is your manifestation" or Markdown headers.
    -   **Fix**: Added regex-based sanitization layer to strip:
        -   Boilerplate intros ("Here is...", "Translation for...")
        -   Metadata lines (Voice info, Language tags)
        -   Markdown formatting artifacts (headers, horizontal rules)
    -   **Result**: Audio now contains *only* the pure manifestation passage.

3.  **Verification Flow** (`backend/verify_flow.py`)
    -   Implemented end-to-end verification script testing:
        -   Health Check → Manifestation Gen → Translation → Audio Gen (EN) → Audio Gen (TA)
    -   Confirmed 100% success rate across all supported languages.

**Stats**: Fixed critical audio failures, improved naturalness of voices, ensured stable multi-language support.

---

### January 1, 2026 - Interaction Flow Enhancement

#### 🎯 UX/UI Improvements
1. **Strict Workflow Logic**
   - Enforced sequential flow: Manifestation → Translation → Audio Generation
   - Disabled audio generation until translation completes
   - Prevented race conditions and duplicate API calls

2. **State Management**
   - Added `translationStatus` tracking (idle/loading/success/error)
   - Added `audioStatus` tracking for each language
   - Enhanced feedback for disabled actions

3. **User Experience Safety**
   - Clear visual feedback for why actions are disabled
   - Prevented audio generation on incomplete translations
   - Improved error handling and user notifications

**Stats**: Enhanced state management logic, improved UX flow consistency

---

### December 30, 2025 - Audio Generation Fix

#### 🐛 Bug Fixes
1. **Audio Language Handling**
   - Fixed audio generation to use correct translated text for non-English languages
   - Ensured language selection UI only displays successfully translated languages
   - Fixed backend multi-language audio generation handling

2. **Translation-Audio Integration**
   - Proper text selection based on chosen language (English/Tamil/Hindi)
   - Synchronized language availability between translation and audio generation

**Stats**: Critical bug fixes for multi-language audio workflow

---

### December 29, 2025 - Testing & Refinement

#### 🧪 Quality Assurance
1. **Comprehensive Testing**
   - Full backend API endpoint testing
   - Frontend user flow validation
   - Integration point verification

2. **Bug Resolution**
   - Fixed all TypeScript compilation errors
   - Resolved logical flaws in state management
   - Ensured stable application performance

**Stats**: Application stability improvements across all components

---

### December 26, 2025 - Auto-Fill Feature

#### ⭐ New Features
1. **Form Auto-Fill**
   - Backend endpoint to save and retrieve last submission
   - Frontend button to auto-populate form with previous data
   - Improved user convenience for repeat usage

2. **Data Persistence**
   - Last submission storage system
   - Quick form filling for returning users

**Stats**: 3 files modified for auto-fill functionality

---

### December 23, 2025 - Backend Architecture & Multi-Language Support

#### 🏗️ Major Rebuild
1. **Backend Architecture Refactor**
   - Modular FastAPI structure with clean separation of concerns
   - Core modules: config, security, database operations
   - Service modules: LLM, TTS, Vector Search
   - Async API design throughout

2. **Multi-Language Audio Support**
   - Generate audio in English, Tamil, and Hindi
   - Native voice support for each language (male/female)
   - Dynamic language selector (only shows translated languages)

3. **RAG-Based Translation System**
   - ChromaDB vector database for translation memory
   - Semantic chunking for better quality
   - Context-aware translations with past examples

4. **Performance Optimization**
   - Embedding cache system (90% faster repeat translations)
   - Persistent cache storage
   - Optimized chunking strategy

5. **TTS Voice Quality**
   - Indian-accented English voices (Prabhat/Neerja)
   - Tamil native voices (Valluvar/Pallavi)
   - Hindi native voices (Madhur/Swara)
   - Adjusted speaking rate for ~5-minute audio duration
   - Output persistence with `username_timestamp` naming

6. **Frontend-Backend Integration**
   - CORS configuration
   - API connectivity verification
   - Seamless communication between services

#### 🔧 Technical Improvements
- Added 6 new backend modules (cache, chunker, embeddings, vector_store, rag_translate, translation)
- Enhanced TTS module with multi-language support
- Updated API schemas for language parameters
- Improved frontend state management for translations
- Structured project with `/api/v1/` versioned endpoints

#### 📝 Documentation
- Comprehensive development log
- RAG & Vector DB explanation
- API testing results
- Git commit guide
- Complete project structure documentation

#### 🐛 Bug Fixes
- Fixed UI crash after "This looks perfect" button
- Fixed language buttons showing before translation
- Fixed audio generation with language parameter
- Removed all "Lovable" branding references

**Stats**: 16+ files changed, 1,500+ insertions, complete backend reorganization

---

## 👨‍💻 Development

> 📖 **Developer Guide**: See [docs/DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) for complete setup, workflow, and contribution guidelines.

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

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design, data flow, and component details |
| [API_REFERENCE.md](./docs/API_REFERENCE.md) | Complete API documentation with examples |
| [DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) | Setup, development workflow, coding standards |
| [USER_GUIDE.md](./docs/USER_GUIDE.md) | End-user instructions and best practices |
| [DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Production deployment guide (Docker, PaaS, etc.) |
| [RAG_SYSTEM.md](./docs/RAG_SYSTEM.md) | Deep dive into translation pipeline |
| [CONTRIBUTING.md](./docs/CONTRIBUTING.md) | Contribution guidelines and standards |
| [CHANGELOG.md](./CHANGELOG.md) | Version history and release notes |

---

## 🤝 Contributing

> 📖 **Full Guidelines**: See [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) for detailed contribution process.

We welcome contributions! Here's how to get started:

1. Read [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines
2. Fork the repository
3. Create a feature branch (`git checkout -b feature/amazing-feature`)
4. Make your changes following our coding standards
5. Test thoroughly
6. Commit with conventional commit messages
7. Push to your fork
8. Open a Pull Request

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and release notes.

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

*Made with ❤️ and positive intentions by Suthikshaa Aghoram*

**Last Updated**: January 1, 2026
