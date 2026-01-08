# Changelog

All notable changes to AfflimAI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation suite in `docs/` directory

---

## [1.1.0] - 2026-01-08

### Changed - January 8, 2026

#### 🎨 UI Evolution: "Mystic" Audio Experience
- **Complete Re-design**: Audio Page now features a modern 2-column layout (Settings vs Player)
- **Deep Personalization**: Updated color palette with "Mystic" tokens (`mystic-violet`, `mystic-dark`) for a premium, ethereal feel.
- **Improved Player**: Separated Background Music controls into a dedicated card for better usability.

#### 📝 Form Experience
- **Flexible Inputs**: Made all fields **OPTIONAL** except for "Preferred Name".
- **Smart Validation**: Validates only the name, allowing for instant, low-friction generation.
- **Smart Dropdowns**: Replaced text inputs with intelligent dropdowns for Nakshatra (27 stars) and Lagna (12 signs).

#### 🧠 Backend Intelligence
- **Prompt Logic**: Updated LLM prompts to **strictly ignore empty fields**.
- **Anti-Hallucination**: The AI now silently adapts to missing data instead of inventing details or complaining about it.

---

## [1.0.0] - 2026-01-01

### Added - January 1, 2026

#### UX/UI Improvements
- **Strict Workflow Logic**: Enforced sequential flow (Manifestation → Translation → Audio Generation)
- **State Management**: Added `translationStatus` tracking (idle/loading/success/error)
- **Audio Status Tracking**: Per-language audio generation status
- **Enhanced User Feedback**: Clear visual feedback for disabled actions

**Impact**: Prevented race conditions, duplicate API calls, and improved user experience consistency

---

## [0.9.0] - 2025-12-30

### Fixed - December 30, 2025

#### Bug Fixes
- **Audio Language Handling**: Fixed audio generation to use correct translated text for non-English languages
- **Language Selection UI**: Language selection now only displays successfully translated languages
- **Backend Multi-Language Audio**: Fixed backend handling of multi-language audio generation

#### Improvements
- **Translation-Audio Integration**: Proper text selection based on chosen language (English/Tamil/Hindi)
- **Language Availability Sync**: Synchronized language availability between translation and audio generation

**Impact**: Critical bug fixes for multi-language audio workflow

---

## [0.8.0] - 2025-12-29

### Changed - December 29, 2025

#### Quality Assurance
- **Comprehensive Testing**: Full backend API endpoint testing completed
- **Frontend Validation**: User flow validation across all components
- **Integration Testing**: Verified all integration points

#### Bug Resolution
- Fixed all TypeScript compilation errors
- Resolved logical flaws in state management
- Ensured stable application performance across all components

**Impact**: Application stability improvements, production-ready codebase

---

## [0.7.0] - 2025-12-26

### Added - December 26, 2025

#### New Features
- **Form Auto-Fill**: Backend endpoint to save and retrieve last submission
- **Quick Form Population**: Frontend button to auto-populate form with previous data
- **User Convenience**: Improved experience for returning users

#### Implementation
- Last submission storage system
- `/api/v1/last-submission` endpoint
- Auto-fill button in manifestation form

**Stats**: 3 files modified for auto-fill functionality

---

## [0.6.0] - 2025-12-23

### Added - December 23, 2025

#### Major Features

##### Backend Architecture Refactor
- Modular FastAPI structure with clean separation of concerns
- Core modules: `config.py`, `schemas.py`, `prompt.py`, `hf_client.py`
- Service modules: `tts.py`, `embeddings.py`, `vector_store.py`, `rag_translate.py`, `cache.py`, `chunker.py`
- Async API design throughout the application
- Versioned API endpoints (`/api/v1/`)

##### Multi-Language Audio Support
- Generate audio in English, Tamil, and Hindi
- Native voice support for each language (male/female options)
- Dynamic language selector (only shows translated languages)
- High-quality TTS with Microsoft Edge TTS

**Voice Options**:
- English: Prabhat (M), Neerja (F) - Indian accent
- Tamil: Valluvar (M), Pallavi (F)
- Hindi: Madhur (M), Swara (F)

##### RAG-Based Translation System
- ChromaDB vector database for translation memory
- Semantic chunking for better quality (4-6 chunks per manifestation)
- Context-aware translations with past examples
- Multilingual embeddings (MiniLM-L12-v2)
- DeepSeek-V3 LLM for high-quality translation

##### Performance Optimization
- Embedding cache system (90% faster repeat translations)
- Persistent cache storage
- Optimized chunking strategy (60% reduction in API calls)
- First translation: 30-40s, Cached: 5-8s

##### TTS Voice Quality
- Indian-accented English voices for cultural resonance
- Native Tamil and Hindi voices
- Adjusted speaking rate for natural listening (~5 minutes for 500 words)
- Output persistence with `username_timestamp` naming convention

##### Frontend-Backend Integration
- CORS configuration for development
- API connectivity verification
- Seamless communication between services
- Error handling and user feedback

#### Technical Improvements
- **New Modules**: 6 new backend modules (cache, chunker, embeddings, vector_store, rag_translate, translation endpoint)
- **Enhanced TTS**: Multi-language support with language parameter
- **Updated Schemas**: API schemas for language parameters
- **State Management**: Improved frontend state management for translations
- **Project Structure**: Clean `/api/v1/` versioned endpoints

#### Documentation
- Comprehensive development log
- RAG & Vector DB explanation
- API testing results documentation
- Git commit workflow guide
- Complete project structure documentation

#### Bug Fixes
- Fixed UI crash after "This looks perfect" button
- Fixed language buttons showing before translation completion
- Fixed audio generation with language parameter
- Removed all "Lovable" branding references from codebase

**Stats**: 16+ files changed, 1,500+ insertions, complete backend reorganization

---

## [0.5.0] - Earlier

### Added
- Initial manifestation generation with DeepSeek-V3
- Astrological integration (Nakshatra, Lagna)
- Psychological profiling (strengths, goals, achievements)
- Beautiful React + Tailwind frontend
- Form validation with Zod
- Basic audio generation (English only)

---

## Version History Summary

| Version | Date | Key Feature |
|---------|------|-------------|
| 1.0.0 | 2026-01-01 | UX improvements, workflow enforcement |
| 0.9.0 | 2025-12-30 | Multi-language audio bug fixes |
| 0.8.0 | 2025-12-29 | Testing & quality assurance |
| 0.7.0 | 2025-12-26 | Auto-fill feature |
| 0.6.0 | 2025-12-23 | RAG translation, multi-language audio, architecture refactor |
| 0.5.0 | Earlier | Initial release with basic features |

---

## Upgrade Notes

### Upgrading to 1.0.0

No breaking changes. Simply pull the latest code and restart services.

### Upgrading to 0.6.0

**Required Actions**:
1. Install new dependencies:
   ```bash
   pip install chromadb sentence-transformers nltk
   python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab')"
   ```
2. ChromaDB will auto-create on first run
3. No database migration needed (vector DB is new)

---

## Links

- [Repository](https://github.com/yourusername/AfflimAI)
- [Documentation](./docs/)
- [Issues](https://github.com/yourusername/AfflimAI/issues)
- [Releases](https://github.com/yourusername/AfflimAI/releases)

---

*Last Updated: January 2, 2026*
