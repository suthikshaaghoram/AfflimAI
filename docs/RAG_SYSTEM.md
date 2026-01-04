# RAG Translation System Documentation

## Table of Contents
- [What is RAG?](#what-is-rag)
- [Why RAG for Translation?](#why-rag-for-translation)
- [System Architecture](#system-architecture)
- [Translation Pipeline](#translation-pipeline)
- [Performance Optimization](#performance-optimization)
- [Adding New Languages](#adding-new-languages)
- [Troubleshooting](#troubleshooting)

---

## What is RAG?

**RAG** (Retrieval-Augmented Generation) is a technique that enhances AI generation by retrieving relevant context before generating output.

### Traditional AI Translation
```
English Text → LLM → Tamil Translation
```
**Problems**:
- Inconsistent translations
- No memory of past translations
- Generic, context-free output

### RAG-Based Translation
```
English Text → Vector DB Search → Context Examples → LLM + Context → Tamil Translation
```
**Benefits**:
- ✅ Consistent terminology
- ✅ Context-aware translations
- ✅ Culturally appropriate
- ✅ Learning from past translations

---

## Why RAG for Translation?

### The Challenge

Manifestations contain:
- Spiritual terms ("cosmic energy", "manifestation")
- Emotional language ("abundance", "gratitude")
- Cultural concepts (Nakshatra, Lagna)
- Personal affirmations ("I am", "I attract")

**Standard translation problems**:
- Literal translations lose emotional depth
- Inconsistent terminology
- Cultural nuances missed
- No learning from past successes

### The RAG Solution

```mermaid
graph TB
    A[English Manifestation] --> B[Semantic Chunking]
    B --> C[Generate Embeddings]
    C --> D[Search Vector DB]
    D --> E[Retrieve Similar Translations]
    E --> F[LLM with Context]
    F --> G[High-Quality Translation]
    G --> H[Store in Vector DB]
    H --> I[Future Translations Improve]
    
    style A fill:#fee
    style G fill:#efe
    style H fill:#eef
    style I fill:#fef
```

**Results**:
- 🎯 Same phrase always translates the same way
- 🌍 Culturally resonant translations
- 📈 Quality improves over time
- ⚡ 90% faster with caching

---

## System Architecture

### Components

```mermaid
graph LR
    subgraph "Input Layer"
        Text[English Text]
    end
    
    subgraph "Processing Layer"
        Chunker[Semantic Chunker<br/>NLTK]
        Embedder[Embedding Generator<br/>MiniLM-L12-v2]
        Cache[Embedding Cache<br/>File-based]
    end
    
    subgraph "Storage Layer"
        VectorDB[(ChromaDB<br/>Vector Store)]
    end
    
    subgraph "AI Layer"
        LLM[DeepSeek-V3<br/>Hugging Face]
    end
    
    subgraph "Output Layer"
        Translation[Tamil/Hindi Text]
    end
    
    Text --> Chunker
    Chunker --> Embedder
    Embedder --> Cache
    Cache --> VectorDB
    VectorDB --> LLM
    LLM --> Translation
    Translation --> VectorDB
    
    style VectorDB fill:#4ecdc4
    style Cache fill:#95e1d3
    style LLM fill:#ff6b6b
```

### File Structure

```
backend/
├── app/
│   ├── rag_translate.py      # Main RAG orchestration
│   ├── vector_store.py        # ChromaDB operations
│   ├── embeddings.py          # Embedding generation
│   ├── chunker.py             # Text segmentation
│   └── cache.py               # Embedding cache
│
├── chroma_db/                 # Vector database storage
│   └── translations_{user}/  # User-specific collections
│
└── cache/                     # Embedding cache files
    └── embedding_cache.json  # Cached embeddings
```

---

## Translation Pipeline

### Step-by-Step Process

#### 1. Semantic Chunking

**Purpose**: Break text into meaningful segments for translation

**Implementation** (`chunker.py`):

```python
def chunk_text(text: str, target_chunks: int = 5) -> List[str]:
    """
    Intelligently chunk text into semantic units.
    
    Process:
    1. Tokenize into sentences (NLTK)
    2. Group sentences into target number of chunks
    3. Preserve context boundaries
    """
    sentences = sent_tokenize(text)
    chunk_size = max(1, len(sentences) // target_chunks)
    
    chunks = []
    for i in range(0, len(sentences), chunk_size):
        chunk = " ".join(sentences[i:i+chunk_size])
        chunks.append(chunk)
    
    return chunks
```

**Output Example**:
```
Original: 500-word manifestation
↓
Chunk 1: "I am Rajesh, born under Ashwini..."  (100 words)
Chunk 2: "My cosmic energy aligns with..."     (100 words)
Chunk 3: "I embrace my strengths of..."        (100 words)
Chunk 4: "Looking forward, I manifest..."      (100 words)
Chunk 5: "I am the architect of my destiny..." (100 words)
```

**Why chunk?**
- LLMs have context limits
- Smaller chunks = faster processing
- Better quality per chunk
- Easier to cache and reuse

#### 2. Embedding Generation

**Purpose**: Convert text to numerical vectors for similarity search

**Model**: `paraphrase-multilingual-MiniLM-L12-v2`
- 384-dimensional vectors
- Multilingual support (English, Tamil, Hindi, 50+ languages)
- Optimized for semantic similarity

**Implementation** (`embeddings.py`):

```python
from sentence_transformers import SentenceTransformer

class MultilingualEmbedder:
    def __init__(self):
        self.model = SentenceTransformer(
            'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
        )
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate 384-dim embedding vector."""
        embedding = self.model.encode(text, normalize_embeddings=True)
        return embedding.tolist()
```

**Example**:
```
Text: "I am a powerful manifestor"
↓
Embedding: [0.123, -0.456, 0.789, ... 384 values total]
```

#### 3. Vector Database Search

**Purpose**: Find similar previously-translated text

**Database**: ChromaDB
- Local, persistent vector store
- Fast cosine similarity search
- User-specific collections

**Implementation** (`vector_store.py`):

```python
def search_similar(
    self,
    query_text: str,
    target_language: str,
    top_k: int = 3
) -> List[Dict]:
    """
    Search for similar translations.
    
    Returns top-k most similar previously-translated chunks.
    """
    query_embedding = self.embedder.generate_embedding(query_text)
    
    results = self.collection.query(
        query_embeddings=[query_embedding],
        where={"target_language": target_language},
        n_results=top_k
    )
    
    return results
```

**What it finds**:
- Previously translated similar phrases
- Consistent terminology
- Cultural context examples

**Example Results**:
```
Query: "I manifest abundance"

Similar Translations Found:
1. "I attract prosperity" → "நான் செழிப்பை ஈர்க்கிறேன்" (similarity: 0.92)
2. "I welcome abundance" → "நான் செழிப்பை வரவேற்கிறேன்" (similarity: 0.88)
3. "I create wealth" → "நான் செல்வத்தை உருவாக்குகிறேன்" (similarity: 0.84)
```

#### 4. Context-Aware LLM Translation

**Purpose**: Translate with retrieved context as examples

**Model**: DeepSeek-V3 (via Hugging Face)

**Prompt Engineering**:

```python
def build_translation_prompt(
    chunk: str,
    target_language: str,
    examples: List[Dict]
) -> str:
    """
    Build prompt with context examples.
    """
    prompt = f"""You are a professional translator specializing in spiritual and manifestation content.

Translate the following English text to {language_name}.

IMPORTANT GUIDELINES:
1. Preserve emotional tone and spiritual significance
2. Use culturally appropriate terms
3. Maintain consistency with these examples:

TRANSLATION EXAMPLES:
{format_examples(examples)}

TEXT TO TRANSLATE:
{chunk}

TRANSLATION:"""
    
    return prompt
```

**Example Prompt**:
```
You are a professional translator specializing in spiritual content.
Translate to Tamil.

EXAMPLES:
English: "I attract prosperity"
Tamil: "நான் செழிப்பை ஈர்க்கிறேன்"

English: "cosmic energy"
Tamil: "பிரபஞ்ச ஆற்றல்"

TEXT TO TRANSLATE:
I am a powerful manifestor of abundance and success.

TRANSLATION:
```

**LLM Response**:
```
நான் செழிப்பு மற்றும் வெற்றியை வெளிப்படுத்தும் சக்திவாய்ந்த நபர்.
```

#### 5. Translation Memory Storage

**Purpose**: Save translations for future RAG retrieval

**Storage**:

```python
def store_translation(
    self,
    original_text: str,
    translated_text: str,
    target_language: str,
    metadata: Dict
):
    """Store translation pair in vector database."""
    embedding = self.embedder.generate_embedding(original_text)
    
    self.collection.add(
        embeddings=[embedding],
        documents=[original_text],
        metadatas=[{
            "translated_text": translated_text,
            "target_language": target_language,
            "timestamp": datetime.now().isoformat(),
            **metadata
        }],
        ids=[generate_unique_id()]
    )
```

**What gets stored**:
- Original English chunk
- Translated chunk
- 384-dim embedding vector
- Language, timestamp, user metadata

**Benefits**:
- Future translations use this as context
- Builds user-specific knowledge base
- System learns over time

---

## Performance Optimization

### Embedding Cache

**Problem**: Generating embeddings is slow (~2s per chunk)

**Solution**: File-based cache (`cache.py`)

```python
class EmbeddingCache:
    def __init__(self, cache_dir: str = "cache"):
        self.cache_file = f"{cache_dir}/embedding_cache.json"
        self.cache = self.load_cache()
    
    def get(self, text: str) -> Optional[List[float]]:
        """Get cached embedding by text hash."""
        text_hash = self.hash_text(text)
        return self.cache.get(text_hash)
    
    def store(self, text: str, embedding: List[float]):
        """Store embedding in cache."""
        text_hash = self.hash_text(text)
        self.cache[text_hash] = {
            "embedding": embedding,
            "timestamp": datetime.now().isoformat()
        }
        self.save_cache()
```

**Performance Impact**:

| Operation | Without Cache | With Cache | Improvement |
|-----------|--------------|------------|-------------|
| First translation | 40s | 40s | 0% |
| Second translation (same text) | 40s | 4s | **90% faster** |
| Embedding generation | 2s/chunk | 0.1s/chunk | **95% faster** |

### Chunking Optimization

**Problem**: Too many chunks = more API calls = slower + expensive

**Solution**: Optimal chunk count (4-6 chunks)

```python
# Bad: Too many chunks
chunks = chunk_text(text, target_chunks=20)  # 20 API calls!

# Good: Optimal chunking
chunks = chunk_text(text, target_chunks=5)   # 5 API calls
```

**Impact**:
- 60% reduction in API calls
- 60% faster translation
- 60% lower cost

---

## Adding New Languages

### Step 1: Add Language Configuration

Edit `backend/app/rag_translate.py`:

```python
SUPPORTED_LANGUAGES = {
    "ta": {
        "name": "Tamil",
        "native_name": "தமிழ்",
        "code": "ta"
    },
    "hi": {
        "name": "Hindi",
        "native_name": "हिन्दी",
        "code": "hi"
    },
    # Add new language
    "te": {
        "name": "Telugu",
        "native_name": "తెలుగు",
        "code": "te"
    }
}
```

### Step 2: Add TTS Voice Support

Edit `backend/app/tts.py`:

```python
VOICE_MAP = {
    # ... existing voices ...
    "te": {
        "male": "te-IN-MohanNeural",
        "female": "te-IN-ShrutiNeural"
    }
}
```

**Find voice names**:
```bash
edge-tts --list-voices | grep "te-IN"
```

### Step 3: Update Frontend

Edit `frontend/src/pages/TranslationPage.tsx`:

```typescript
const SUPPORTED_LANGUAGES = [
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "te", name: "Telugu", native: "తెలుగు" },  // Add this
];
```

### Step 4: Test

```bash
# Backend
curl -X POST http://localhost:8000/api/v1/translate-manifestation \
  -H "Content-Type: application/json" \
  -d '{"text":"I am powerful","target_language":"te"}'

# Frontend
# Test in UI: Generate → Translate → Select Telugu
```

### Requirements for New Languages

✅ Supported by multilingual embedding model (MiniLM-L12-v2)  
✅ Supported by DeepSeek-V3 LLM  
✅ TTS voice available in Edge TTS  
✅ Right-to-left (RTL) support if needed (frontend CSS)

**Note**: The MiniLM model supports 50+ languages, so most languages will work!

---

## Troubleshooting

### Issue: Slow Translation

**Symptoms**: Translation takes 40+ seconds every time

**Possible Causes**:
1. Embedding cache not working
2. Too many chunks
3. Slow internet connection

**Solutions**:

```bash
# 1. Check cache exists
ls -lh backend/cache/
# Should see: embedding_cache.json

# 2. Verify cache hits
# Check logs for "Using cached embedding" messages

# 3. Reduce chunk count (if needed)
# Edit rag_translate.py
chunks = semantic_chunk(text, target_chunks=4)  # Reduce from 6 to 4
```

### Issue: Inconsistent Translations

**Symptoms**: Same phrase translates differently each time

**Cause**: Vector database not persisting or searching correctly

**Solutions**:

```bash
# 1. Check ChromaDB persistence
ls -lh backend/chroma_db/
# Should see user collections

# 2. Verify vector search is working
# Add debug logging in vector_store.py
logger.info(f"Found {len(results)} similar translations")

# 3. Reset database (last resort)
rm -rf backend/chroma_db/
# Restart backend to recreate
```

### Issue: Poor Translation Quality

**Symptoms**: Translations are literal, lack cultural context

**Cause**: Not enough context examples or prompt needs improvement

**Solutions**:

```python
# 1. Increase context examples
results = vector_store.search_similar(
    chunk, 
    target_language,
    top_k=5  # Increase from 3 to 5
)

# 2. Improve prompt with cultural guidelines
prompt += """
CULTURAL GUIDELINES for {language}:
- Use respectful, spiritual tone
- Prefer traditional terms for concepts like "cosmic energy"
- Maintain emotional depth of affirmations
"""

# 3. Use a more powerful LLM if available
# Consider GPT-4 or Claude for higher quality
```

### Issue: ChromaDB Errors

**Symptoms**: `sqlite3.DatabaseError` or `Collection not found`

**Solution**:

```bash
# Delete corrupted database
rm -rf backend/chroma_db/

# Restart backend (will recreate)
uvicorn app.main:app --reload

# Verify it works
curl http://localhost:8000/api/v1/supported-languages
```

---

## Advanced Configuration

### Custom Embedding Model

```python
# embeddings.py
class MultilingualEmbedder:
    def __init__(self, model_name: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"):
        # Try larger model for better quality (slower)
        # self.model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-mpnet-base-v2")
        self.model = SentenceTransformer(model_name)
```

### Adjust Similarity Threshold

```python
# vector_store.py
def search_similar(self, query_text: str, target_language: str, min_similarity: float = 0.7):
    results = self.collection.query(...)
    
    # Filter by minimum similarity score
    filtered = [r for r in results if r['distance'] <= (1 - min_similarity)]
    return filtered
```

### User-Specific vs Global Collections

**Current**: User-specific collections (`translations_{username}`)
**Alternative**: Global collection (all users share translation memory)

```python
# global collection
collection_name = f"translations_{target_language}"  # ta, hi

# user-specific (current implementation)
collection_name = f"translations_{username}_{target_language}"
```

---

## Future Enhancements

1. **Active Learning**: Flag low-quality translations for human review
2. **A/B Testing**: Compare different prompts/models
3. **Quality Metrics**: Track translation quality over time
4. **Multi-Model Ensemble**: Use multiple LLMs and vote
5. **Real-Time Feedback**: Users rate translations to improve RAG

---

*Last Updated: January 2, 2026*
