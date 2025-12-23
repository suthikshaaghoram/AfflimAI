# ✨ AffirmAI - AI Manifestation Generator

**AffirmAI** is an AI-powered personalized manifestation generator that blends ancient astrological wisdom with modern psychology. It generates customized manifestation passages and converts them into soothing audio using Tamil-accented English voices, creating a deeply personal and immersive experience.

![AffirmAI UI](https://via.placeholder.com/800x400?text=AffirmAI+Preview)

---

## 🎯 Scope & Benefits

### **Scope**
AffirmAI goes beyond simple affirmation apps by combining three powerful domains:
1.  **Astrology**: Analyzes user birth details (Nakshatra, Lagna) to align manifestations with cosmic energy.
2.  **Psychology**: Incorporates user-defined strengths, weaknesses, and life goals to ensure the content is psychologically resonant and motivating.
3.  **Artificial Intelligence**: Utilizes advanced Large Language Models (LLMs) to synthesize this data into unique, poetic, and empowering narratives.

### **Benefits**
*   **Deep Personalization**: Every passage is unique to the user's life path and astrological blueprint.
*   **Enhanced Focus**: By articulating specific goals and achievements, the app helps users visualize their desired future with clarity.
*   **Mental Well-being**: Promoting positive self-talk and resilience through tailored affirmations helps reduce anxiety and boost confidence.
*   **Multi-Sensory Experience**: The combination of visual reading and auditory listening (via soothing TTS) reinforces the manifestation message in the subconscious mind.

---

## 🚀 Features

- **Personalized Manifestations**: Generates unique affirmations based on comprehensive user inputs (Name, Birth Date/Time/Place, Goals, Achievements).
- **Astrological Integration**: specific logic to incorporate Nakshatra (Lunar Mansion) and Lagna (Ascendant) traits.
- **AI-Powered Generation**: Uses **DeepSeek-V3** (via Hugging Face) to craft meaningful, context-aware content.
- **Text-to-Speech (TTS)**: Converts manifestations into audio using `edge-tts` with high-quality **Singapore Tamil Neural voices** (Male/Female) for a comforting tone.
- **Modern UI**: A beautiful, responsive, and accessible frontend built with modern web standards.

---

## 🛠️ Technology Stack & APIs

### **Frontend (User Interface)**
Built with a focus on performance, accessibility, and aesthetics.
*   **Core Framework**: [React 18](https://react.dev/) with [Vite](https://vitejs.dev/) (for fast build capability).
*   **Language**: [TypeScript](https://www.typescriptlang.org/) (for type safety and maintainability).
*   **Styling**: 
    *   [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS framework).
    *   `tailwindcss-animate` (Animation utilities).
*   **UI Components & Primitives**: 
    *   [Radix UI](https://www.radix-ui.com/) (Headless, accessible components like Dialog, Separator, Toast, etc.).
    *   `lucide-react` (Beautiful & consistent iconography).
*   **State & Interaction**: 
    *   `react-hook-form` with `@hookform/resolvers` & `zod` (Robust form validation).
    *   `@tanstack/react-query` (Efficient server state management).
    *   `sonner` (Toast notifications).

### **Backend (API & Logic)**
Robust, asynchronous python backend.
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (High-performance web framework).
*   **Server**: [Uvicorn](https://www.uvicorn.org/) (ASGI server).
*   **Environment Management**: `python-dotenv` & `pydantic-settings`.

### **External APIs & Services**
1.  **AI Text Generation**: 
    *   **Provider**: [Hugging Face Inference API](https://huggingface.co/inference-api).
    *   **Model**: `deepseek-ai/DeepSeek-V3` (A powerful open-weights LLM optimized for creative logic).
2.  **Text-to-Speech (TTS)**:
    *   **Library**: `edge-tts` (Python wrapper for Microsoft Edge's online TTS service).
    *   **Voices Used**: `ta-SG-AnbuNeural` (Male) and `ta-SG-VenbaNeural` (Female) - chosen for their soothing, clear Tamil-accented English delivery.

---

## 📂 Project Structure

```mermaid
graph TD
    Root[AfflimAI] --> Backend[backend/]
    Root --> Frontend[frontend/]
    
    Backend --> App[app/]
    App --> Main[main.py]
    App --> Api[api/]
    App --> Core[core/config.py]
    Backend --> Outputs[outputs/ (Generated Audio/Text)]
    
    Frontend --> Src[src/]
    Src --> Comps[components/ (UI Blocks)]
    Src --> Pages[pages/ (Views)]
    Src --> Lib[lib/ (Utils)]
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **Hugging Face API Token** (Get one for free at [huggingface.co](https://huggingface.co/settings/tokens))

### 1️⃣ Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   Create a `.env` file in the `backend` folder:
   ```env
   HUGGINGFACE_API_KEY=your_hf_token_here
   MODEL_ID=deepseek-ai/DeepSeek-V3.2
   ```
5. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *Server running at: `http://localhost:8000`*

### 2️⃣ Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *Frontend running at: `http://localhost:5173`*

---

## 📖 Usage Guide

1. **Access the App**: Open [http://localhost:5173](http://localhost:5173).
2. **Enter Details**: Fill in the form with your Name, Birth info, Goals, and Manifestation Focus.
3. **Generate**: Click **"Generate Manifestation"**. The AI will craft your personalized passage.
4. **Listen**: Once generated, click the **Audio** button to hear it read aloud in a soothing voice.

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| **403 Error (Audio)** | Ensure `edge-tts` is updated to the latest version (`pip install --upgrade edge-tts`). Restart the backend server. |
| **Manifestation Stalls** | Check your Hugging Face API token validity. Ensure you have internet access. |
| **CORS Errors** | Ensure Backend is running on port `8000`. The backend is configured to allow requests from localhost. |

---

## 👨‍💻 Development

### API Reference

#### 1. Generate Manifestation
Generates a personalized AI manifestation passage based on user inputs.

- **Endpoint**: `POST /api/v1/generate-manifestation`
- **Content-Type**: `application/json`
- **Request Body Example**:
  ```json
  {
    "preferred_name": "Jordan",
    "birth_date": "1994-06-15",
    "nakshatra": "Mrigashirsha",
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
- **Response**: JSON containing the generated `manifestation_text`.

#### 2. Generate Audio (TTS)
Converts the generated text into speech using high-quality neural voices.

- **Endpoint**: `POST /api/v1/generate-audio`
- **Content-Type**: `application/json`
- **Request Body Example**:
  ```json
  {
    "text": "Jordan, you stand in a moment of deep clarity...",
    "gender": "female",
    "username": "Jordan"
  }
  ```
  - `gender`: `"male"` (uses `ta-SG-AnbuNeural`) or `"female"` (uses `ta-SG-VenbaNeural`).
- **Response**: Binary MP3 file (audio/mpeg).

### Contributing
1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.

---

*Made with ❤️ and positive intentions.*
