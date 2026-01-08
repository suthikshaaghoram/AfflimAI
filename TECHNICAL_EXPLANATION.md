# 🧠 AfflimAI - Technical Deep Dive & System Architecture

This document provides a comprehensive technical overview of **AfflimAI**, designed to explain the system's engineering to senior stakeholders.

## 1. Executive Summary
AfflimAI is a **full-stack GenAI application** that generates hyper-personalized manifestation affirmations. Unlike simple wrappers, it orchestrates a complex pipeline of **Astrology, Psychology, and Neural AI** to create emotionally resonant content. It features a robust **Stealth Scraper** for LinkedIn integration and a **RAG-based Translation Engine** for high-fidelity multi-language support.

---

## 2. High-Level Architecture

```mermaid
graph TD
    User[End User] --> FE[React Frontend (Vite)]
    FE --> |JSON/HTTPS| API[FastAPI Backend]
    
    subgraph "Ingestion Layer"
        API --> |Stealth Request| Scraper[LinkedIn Scraper]
        Scraper --> |Bypass| Captcha[AI Captcha Solver (Buster)]
        Scraper --> |Headless| Chrome[Chrome Instance]
    end
    
    subgraph "Intelligence Layer"
        API --> |Prompting| Manager[Provider Manager]
        Manager --> |Failover| Novita[Novita/DeepSeek]
        Manager --> |Fallback| Llama[Llama 3 / Groq]
    end
    
    subgraph "Translation Layer (RAG)"
        API --> |Text| Chunker[Semantic Chunker]
        Chunker --> |Vectors| Embed[Sentence-Transformers]
        Embed --> |Storage| DB[ChromaDB Vector Store]
        DB <--> |Context| TransContext[Translation Memory]
    end
    
    subgraph "Delivery Layer"
        API --> |SSML| TTS[Edge TTS Engine]
        TTS --> |MP3| Audio[Audio Output]
    end
```

---

## 3. Core Technical Components

### A. Frontend (The Experience)
*   **Framework**: **React 18** with **Vite** for sub-millisecond HMR (Hot Module Replacement).
*   **State Management**: **TanStack Query (React Query)** handles server state, caching, and optimistic updates.
*   **Styling**: **Tailwind CSS** with `shadcn/ui` (Radix Primitives) for accessible, GPU-accelerated animations.
*   **Validation**: **Zod** schema validation integrated with **React Hook Form** ensures type-safe user inputs.

### B. Backend (The Brain)
*   **Runtime**: **Python 3.11** running on **FastAPI** (ASGI).
*   **Architecture**: Fully **Asynchronous (Async/Await)** to handle non-blocking AI and scraping operations concurrently.
*   **Dependency Injection**: Modular service architecture (TTS Service, Translation Service, Scraper Service).

### C. The Intelligence Engine (AI)
We don't rely on a single model. We use a **Multi-Provider Failover System**:
1.  **Primary**: **DeepSeek-V3** (via Novita/HuggingFace) for high creative reasoning.
2.  **Fallback**: **Llama 3 / Mixtral** (via Groq) for high-speed low-latency responses.
3.  **Local**: **Ollama** (supports offline/local inference if configured).

---

## 4. Key Technical Innovations (The "Wow" Factors)

### 🕵️‍♂️ 1. Stealth LinkedIn Scraper
This is not a basic request library. It is a fully autonomous browser agent.
*   **Technology**: **Playwright** with `playwright-stealth` plugin.
*   **Evasion**:
    *   **Fingerprint Spoofing**: Overrides `navigator.webdriver`, mocks screen resolution, and randomizes User-Agent.
    *   **AI Captcha Solver**: If LinkedIn presents a reCAPTCHA, the system detects the iframe, injects the **Buster** extension, and uses computer vision to click the "Solve" button automatically.
    *   **Deep Scanning**: Recursively scans nested iframes to find hidden security checkpoints.
    *   **Background Mode**: Runs in `--headless=new` mode, which preserves extension functionality (unlike old headless Chrome) while remaining invisible.

### 🗣️ 2. "Aruna" High-Fidelity Translation Engine
Standard translation (Google Translate) fails at emotional nuance. We built a **RAG (Retrieval-Augmented Generation)** system.
*   **Persona-Based Prompting**: The "Aruna" system prompt instructs the LLM to act as a literary poet, not a translator.
*   **RAG Memory**:
    *   Text is split into **Semantic Chunks**.
    *   Chunks are embedded using `sentence-transformers/all-MiniLM-L6-v2`.
    *   Stored in **ChromaDB**.
    *   **Self-Correction**: If a phrase was translated perfectly before, the vector DB retrieves it to ensure consistency across the passage.
*   **Full-Context Optimization**: The engine analyzes text length; short passages are processed in a single block to maintain perfect narrative flow, bypassing chunking artifacts.

### 🎧 3. Human-Like Neural TTS
*   **Engine**: **Microsoft Edge TTS** (Neural).
*   **Prosody Engineering**:
    *   We don't just send text. We preprocess it to inject **natural punctuation** (ellipses, commas) based on sentence structure.
    *   **Audio Sanitization**: A regex layer strips out LLM metadata ("Here is your text...") before audio generation.
    *   **Multi-Lingual**: Supports native Indian-accented English, Tamil-native, and Hindi-native voices seamlessly.

---

## 5. Workflow Data Flow

1.  **Ingestion**: User clicks "Import". Backend spins up Headless Chrome -> logins via saved session -> scrapes profile -> returns structured JSON.
2.  **Generation**: User clicks "Generate". Backend assembles a **Hyper-Personalized Prompt** (linking Past Achievements to Future Goals) -> calls LLM -> streams text.
3.  **Translation**: User selects Tamil. Backend checks context window -> sends to "Aruna" Persona -> returns culturally adapted text.
4.  **Audio**: User plays audio. Backend sanitizes text -> converts to SSML -> generates MP3 -> streams binary to frontend.

---

## 6. Security & Performance
*   **Session Persistence**: Cookies are encrypted and saved to `session.json` to prevent suspicious frequent logins.
*   **Rate Limiting**: Provider Manager handles 429 errors from AI APIs with exponential backoff.
*   **Caching**: RAG embeddings are cached, making repeat translations 90% faster.
