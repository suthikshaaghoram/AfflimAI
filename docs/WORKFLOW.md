# AfflimAI Complete Workflow

This document provides a comprehensive overview of the complete workflow in AfflimAI, from user input to final audio output.

## Table of Contents
- [Overview](#overview)
- [User Journey](#user-journey)
- [Manifestation Generation Workflow](#manifestation-generation-workflow)
- [Translation Workflow (RAG)](#translation-workflow-rag)
- [Audio Generation Workflow](#audio-generation-workflow)
- [Data Flow Architecture](#data-flow-architecture)
- [State Management](#state-management)

---

## Overview

AfflimAI follows a multi-stage workflow:

```mermaid
graph LR
    A[User Input] --> B[Manifestation Generation]
    B --> C[Review & Edit]
    C --> D[Translation]
    D --> E[Audio Generation]
    E --> F[Final Output]
    
    style A fill:#e3f2fd
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e9
    style E fill:#fce4ec
    style F fill:#f1f8e9
```

**Key Stages**:
1. **Input Collection** - User fills manifestation form
2. **AI Generation** - Create personalized manifestation
3. **Review** - User reviews and optionally edits
4. **Translation** - RAG-based multi-language translation
5. **Audio** - Text-to-speech in selected language
6. **Output** - Download/listen to final manifestation

---

## User Journey

### Complete User Flow

```mermaid
graph TD
    Start([User Visits AfflimAI]) --> Form[Fill Manifestation Form]
    Form --> FormData{Form Valid?}
    FormData -->|No| Form
    FormData -->|Yes| Submit[Click Generate]
    
    Submit --> Loading[Loading State<br/>~10-15s]
    Loading --> Review[Review Manifestation]
    
    Review --> ReviewChoice{Satisfied?}
    ReviewChoice -->|No| EditChoice{Edit or<br/>Regenerate?}
    EditChoice -->|Edit| ManualEdit[Edit Text]
    EditChoice -->|Regenerate| Submit
    ManualEdit --> Confirm[Confirm Changes]
    ReviewChoice -->|Yes| Confirm
    
    Confirm --> Result[Final Result Page]
    
    Result --> TransChoice{Want<br/>Translation?}
    TransChoice -->|No| AudioChoice
    TransChoice -->|Yes| SelectLang[Select Language<br/>Tamil or Hindi]
    SelectLang --> Translating[Translating...<br/>~5-40s]
    Translating --> TransResult[View Translation]
    TransResult --> AudioChoice
    
    AudioChoice{Want<br/>Audio?}
    AudioChoice -->|No| Done
    AudioChoice -->|Yes| SelectAudioLang[Select Language<br/>& Gender]
    SelectAudioLang --> GenAudio[Generate Audio<br/>~5-10s]
    GenAudio --> PlayAudio[Play/Download Audio]
    PlayAudio --> Done([Done])
    
    style Start fill:#4caf50
    style Done fill:#4caf50
    style Loading fill:#ff9800
    style Translating fill:#ff9800
    style GenAudio fill:#ff9800
```

### Frontend State Machine

```mermaid
stateDiagram-v2
    [*] --> Form
    Form --> Loading: Submit Form
    Loading --> Review: Generation Complete
    Review --> Form: Regenerate
    Review --> Result: Confirm
    Result --> Translation: Translate Button
    Translation --> Result: Translation Complete
    Result --> Audio: Generate Audio
    Audio --> Result: Audio Ready
    Result --> Form: Start New
    Result --> [*]: Exit
    
    note right of Loading
        Calls: POST /generate-manifestation
        Duration: 10-15s
    end note
    
    note right of Translation
        Calls: POST /translate-manifestation
        Duration: 5-40s (first) / 5-8s (cached)
    end note
    
    note right of Audio
        Calls: POST /generate-audio
        Duration: 5-10s
        Returns: MP3 file
    end note
```

---

## Manifestation Generation Workflow

### Step-by-Step Process

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Prompt
    participant HuggingFace
    participant FileStorage
    
    User->>Frontend: Fill Form & Submit
    Frontend->>Frontend: Validate with Zod
    Frontend->>API: POST /generate-manifestation
    
    API->>Prompt: Build Custom Prompt
    Note over Prompt: Combines:<br/>- Astrological data<br/>- Personal info<br/>- Goals & achievements<br/>- Manifestation focus
    
    Prompt-->>API: Personalized Prompt
    API->>HuggingFace: Generate Text (DeepSeek-V3)
    Note over HuggingFace: LLM generates<br/>~500 word passage
    
    HuggingFace-->>API: Generated Manifestation
    
    API->>FileStorage: Save outputs/{user}_{timestamp}.txt
    API->>FileStorage: Save outputs/last_submission.json
    
    API-->>Frontend: {status, manifestation_text}
    Frontend->>User: Display Manifestation
```

### Prompt Engineering

The system builds a rich prompt from user inputs:

**Template Structure**:
```
I am {name}, born on {birth_date} under the {nakshatra} nakshatra.
My Lagna is {lagna}, which influences my {zodiac_traits}.

STRENGTHS: {strengths}
AREAS TO IMPROVE: {areas_of_improvement}

GREATEST ACHIEVEMENT: {greatest_achievement}
RECENT WIN: {recent_achievement}

NEXT YEAR GOALS: {next_year_goals}
LIFE VISION: {life_goals}
LEGACY: {legacy}

MANIFESTATION FOCUS: {manifestation_focus}

Generate a 500-word manifestation passage that...
[specific AI instructions]
```

**Output Example**:
> "I am Rajesh, born under the dynamic Ashwini Nakshatra with Aries as my Lagna. The cosmic energies of initiation and swift action flow through me, aligning perfectly with my natural leadership abilities..."

---

## Translation Workflow (RAG)

### Complete RAG Pipeline

```mermaid
graph TB
    Input[English Manifestation<br/>500 words] --> Chunk
    
    subgraph "1. Semantic Chunking"
        Chunk[NLTK Sentence Tokenizer]
        Chunk --> Chunks[4-6 Semantic Chunks<br/>~100 words each]
    end
    
    Chunks --> Process
    
    subgraph "2. Per-Chunk Processing"
        Process[For Each Chunk] --> CacheCheck{Embedding<br/>Cached?}
        CacheCheck -->|Yes| LoadCache[Load from Cache<br/>~0.1s]
        CacheCheck -->|No| GenEmbed[Generate Embedding<br/>MiniLM-L12-v2<br/>~2s]
        GenEmbed --> SaveCache[Save to Cache]
        LoadCache --> Embedding
        SaveCache --> Embedding[384-dim Vector]
    end
    
    Embedding --> Search
    
    subgraph "3. Vector Search"
        Search[ChromaDB Query<br/>Cosine Similarity]
        Search --> Results[Top 3 Similar<br/>Translations]
    end
    
    Results --> Translate
    
    subgraph "4. Context-Aware Translation"
        Translate[Build Prompt with<br/>Context Examples]
        Translate --> LLM[DeepSeek-V3<br/>Translation<br/>~5-8s]
        LLM --> TransChunk[Translated Chunk]
    end
    
    TransChunk --> Store
    
    subgraph "5. Storage"
        Store[Store in ChromaDB]
        Store --> Memory[Translation Memory<br/>Future Context]
    end
    
    Memory --> Check{More<br/>Chunks?}
    Check -->|Yes| Process
    Check -->|No| Combine[Combine All Chunks]
    Combine --> Output[Complete Translation]
    
    style Input fill:#e3f2fd
    style Output fill:#c8e6c9
    style Memory fill:#fff9c4
```

### Detailed Sequence

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Chunker
    participant Cache
    participant Embedder
    participant VectorDB
    participant LLM
    participant Storage
    
    User->>Frontend: Click "Translate to Tamil"
    Frontend->>API: POST /translate-manifestation<br/>{text, target_language: "ta"}
    
    API->>Chunker: Semantic Chunk (500 words)
    Chunker-->>API: 5 chunks (~100 words each)
    
    loop For Each Chunk
        API->>Cache: Check Embedding Cache
        alt Cache Hit
            Cache-->>API: Cached Embedding (0.1s)
        else Cache Miss
            API->>Embedder: Generate Embedding
            Embedder-->>API: 384-dim Vector (2s)
            API->>Cache: Store Embedding
        end
        
        API->>VectorDB: Search Similar Translations
        Note over VectorDB: Cosine similarity<br/>Top 3 results
        VectorDB-->>API: Context Examples
        
        API->>LLM: Translate with Context
        Note over LLM: Prompt includes:<br/>- Source chunk<br/>- 3 example translations<br/>- Cultural guidelines
        LLM-->>API: Translated Chunk (5-8s)
        
        API->>VectorDB: Store Translation Pair
    end
    
    API->>Storage: Save outputs/{user}_ta_{timestamp}.txt
    API-->>Frontend: {status, translated_text}
    Frontend->>User: Display Tamil Translation
```

### Performance Timeline

| Step | First Time | Cached | Notes |
|------|-----------|---------|-------|
| Chunking | 0.5s | 0.5s | NLTK processing |
| Embedding (5 chunks) | 10s | 0.5s | **90% cache benefit** |
| Vector Search (5x) | 0.5s | 0.5s | Fast ChromaDB queries |
| LLM Translation (5x) | 25-40s | 25-40s | API-dependent |
| **Total** | **35-50s** | **26-41s** | Cache saves 9s |

---

## Audio Generation Workflow

### TTS Process

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant VoiceMapper
    participant EdgeTTS
    participant Storage
    
    User->>Frontend: Select Language & Gender
    Note over User: Tamil, Female
    
    Frontend->>API: POST /generate-audio<br/>{text, language: "ta", gender: "female"}
    
    API->>VoiceMapper: Map to Voice
    Note over VoiceMapper: ta + female<br/>→ ta-IN-PallaviNeural
    VoiceMapper-->>API: Voice ID
    
    API->>EdgeTTS: Synthesize Audio
    Note over EdgeTTS: Generate MP3<br/>~5 minutes duration<br/>for 500 words
    
    EdgeTTS-->>API: MP3 Binary
    
    API->>Storage: Save outputs/{user}_ta_{timestamp}.mp3
    
    API-->>Frontend: Audio File (MP3)
    Frontend->>User: Play/Download Audio
```

### Voice Selection Matrix

```mermaid
graph LR
    subgraph "Language Selection"
        L1[English]
        L2[Tamil]
        L3[Hindi]
    end
    
    subgraph "Gender Selection"
        G1[Male]
        G2[Female]
    end
    
    subgraph "Voice Output"
        L1 --> G1 --> V1[en-IN-PrabhatNeural]
        L1 --> G2 --> V2[en-IN-NeerjaNeural]
        L2 --> G1 --> V3[ta-IN-ValluvarNeural]
        L2 --> G2 --> V4[ta-IN-PallaviNeural]
        L3 --> G1 --> V5[hi-IN-MadhurNeural]
        L3 --> G2 --> V6[hi-IN-SwaraNeural]
    end
    
    style V1 fill:#bbdefb
    style V2 fill:#f8bbd0
    style V3 fill:#bbdefb
    style V4 fill:#f8bbd0
    style V5 fill:#bbdefb
    style V6 fill:#f8bbd0
```

---

## Data Flow Architecture

### Complete System Data Flow

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React UI]
        Form[Manifestation Form]
        Result[Result Display]
        Audio[Audio Player]
    end
    
    subgraph "API Layer"
        Router[FastAPI Router]
        ManifestEndpoint[/generate-manifestation]
        TransEndpoint[/translate-manifestation]
        TTSEndpoint[/generate-audio]
        UtilEndpoint[/last-submission]
    end
    
    subgraph "Service Layer"
        PromptService[Prompt Generator]
        HFClient[Hugging Face Client]
        RAGService[RAG Translator]
        TTSService[TTS Service]
    end
    
    subgraph "Infrastructure Layer"
        Embedder[Embedding Generator]
        VectorDB[(ChromaDB<br/>Vector Store)]
        Cache[(Embedding Cache)]
        Files[(File Storage<br/>outputs/)]
    end
    
    subgraph "External Services"
        HF[Hugging Face API<br/>DeepSeek-V3]
        EdgeTTS[Microsoft Edge TTS]
    end
    
    UI --> Form
    Form --> Router
    Router --> ManifestEndpoint
    ManifestEndpoint --> PromptService
    PromptService --> HFClient
    HFClient --> HF
    HF --> Files
    
    Result --> TransEndpoint
    TransEndpoint --> RAGService
    RAGService --> Embedder
    Embedder --> Cache
    RAGService --> VectorDB
    RAGService --> HFClient
    
    Result --> TTSEndpoint
    TTSEndpoint --> TTSService
    TTSService --> EdgeTTS
    EdgeTTS --> Files
    
    Audio --> Files
    
    style UI fill:#e1f5fe
    style VectorDB fill:#fff9c4
    style Cache fill:#f3e5f5
    style Files fill:#fff3e0
    style HF fill:#ffccbc
    style EdgeTTS fill:#ffccbc
```

### Request/Response Flow

**1. Manifestation Generation**
```
User → Frontend → API → Prompt → HF → Storage → API → Frontend → User
Time: 10-15 seconds
```

**2. Translation (First Time)**
```
User → Frontend → API → Chunker → [Embedder → Cache → VectorDB → LLM] × 5 → Storage → API → Frontend → User
Time: 30-40 seconds
```

**3. Translation (Cached)**
```
User → Frontend → API → Chunker → [Cache → VectorDB → LLM] × 5 → Storage → API → Frontend → User
Time: 5-8 seconds
```

**4. Audio Generation**
```
User → Frontend → API → VoiceMapper → EdgeTTS → Storage → API → Frontend → User
Time: 5-10 seconds
```

---

## State Management

### Frontend State Flow

```mermaid
stateDiagram-v2
    direction LR
    
    [*] --> FormState
    
    state FormState {
        [*] --> Idle
        Idle --> Submitting: User submits
        Submitting --> Success: API success
        Submitting --> Error: API error
        Success --> [*]
        Error --> Idle: Retry
    }
    
    FormState --> ReviewState: Manifestation generated
    
    state ReviewState {
        [*] --> Reviewing
        Reviewing --> Editing: Edit mode
        Editing --> Reviewing: Save changes
        Reviewing --> [*]: Confirm
    }
    
    ReviewState --> ResultState: Confirmed
    
    state ResultState {
        [*] --> Display
        Display --> TranslationState: Translate
        Display --> AudioState: Generate Audio
        TranslationState --> Display: Translation done
        AudioState --> Display: Audio ready
    }
    
    state TranslationState {
        [*] --> Idle
        Idle --> Translating: Select language
        Translating --> Success: Translation complete
        Translating --> Error: Translation failed
        Success --> [*]
        Error --> Idle: Retry
    }
    
    state AudioState {
        [*] --> Idle
        Idle --> Generating: Select voice
        Generating --> Playing: Audio ready
        Generating --> Error: Generation failed
        Playing --> [*]
        Error --> Idle: Retry
    }
    
    ResultState --> FormState: Start new
```

### Backend State Handling

**Manifestation Endpoint**:
```python
Request → Validate → Generate Prompt → Call LLM → Save Files → Response
States: [received, validating, generating, saving, complete, error]
```

**Translation Endpoint**:
```python
Request → Validate Language → Chunk Text → [Embed → Search → Translate] × N → Combine → Save → Response
States: [received, chunking, translating_chunk_1..N, combining, saving, complete, error]
```

**Audio Endpoint**:
```python
Request → Select Voice → Synthesize → Save → Stream Response
States: [received, synthesizing, saving, streaming, complete, error]
```

---

## File Storage Organization

### Directory Structure

```
outputs/
├── Rajesh_20260102_100530.txt              # Original manifestation
├── Rajesh_ta_20260102_100645.txt           # Tamil translation
├── Rajesh_hi_20260102_100712.txt           # Hindi translation
├── Rajesh_en_20260102_100730.mp3           # English audio
├── Rajesh_ta_20260102_100745.mp3           # Tamil audio
└── last_submission.json                     # Auto-fill data

chroma_db/
└── translations_Rajesh/                     # User-specific collection
    ├── metadata.json
    └── data/                                # Vector embeddings

cache/
└── embedding_cache.json                     # Embedding cache
```

### Naming Convention

- **Manifestations**: `{username}_{timestamp}.txt`
- **Translations**: `{username}_{lang_code}_{timestamp}.txt`
- **Audio**: `{username}_{lang_code}_{timestamp}.mp3`
- **Timestamp Format**: `YYYYMMDD_HHMMSS`

---

## Error Handling Workflow

```mermaid
graph TD
    Request[API Request] --> Validate{Valid?}
    Validate -->|No| Error400[400 Bad Request]
    Validate -->|Yes| Process[Process Request]
    
    Process --> External{External<br/>Service Call}
    External -->|Timeout| Retry{Retry?}
    Retry -->|Yes| External
    Retry -->|No| Error503[503 Service Unavailable]
    
    External -->|Success| Save{Save to<br/>Storage}
    Save -->|Fail| Error500[500 Internal Error]
    Save -->|Success| Response200[200 OK Response]
    
    Error400 --> LogError[Log Error]
    Error503 --> LogError
    Error500 --> LogError
    
    LogError --> UserFeedback[User Feedback]
    Response200 --> UserSuccess[User Success State]
    
    style Error400 fill:#ffcdd2
    style Error503 fill:#ffcdd2
    style Error500 fill:#ffcdd2
    style Response200 fill:#c8e6c9
```

---

## Performance Optimization Flow

### Caching Strategy

```mermaid
graph LR
    subgraph "Request Flow"
        R1[Translation Request] --> C1{Embedding<br/>Cache?}
        C1 -->|Hit| Fast[Fast Path<br/>5-8s]
        C1 -->|Miss| Slow[Slow Path<br/>30-40s]
        Slow --> Store[Store in Cache]
        Store --> Future[Future Requests<br/>Use Cache]
    end
    
    subgraph "Cache Types"
        MemCache[Embedding Cache<br/>File-based JSON]
        VectorCache[Vector DB<br/>Translation Memory]
    end
    
    Fast --> VectorCache
    Slow --> MemCache
    Slow --> VectorCache
    
    style Fast fill:#c8e6c9
    style Slow fill:#ffccbc
```

---

## Summary: End-to-End Flow

**Complete User Journey** (First-time user):
```
1. Fill Form (2 min) 
   → 2. Generate Manifestation (15s)
   → 3. Review & Edit (1 min)
   → 4. Translate to Tamil (35s)
   → 5. Generate Tamil Audio (8s)
   → 6. Listen/Download
   
Total Time: ~4 minutes
```

**Returning User** (with cached data):
```
1. Auto-fill Form (5s)
   → 2. Generate Manifestation (15s)
   → 3. Quick Review (10s)
   → 4. Translate to Hindi (7s - cached)
   → 5. Generate Hindi Audio (8s)
   → 6. Listen/Download
   
Total Time: ~45 seconds
```

---

*Last Updated: January 2, 2026*
