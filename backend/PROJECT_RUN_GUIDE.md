# AffirmAI - Project Run Guide 🚀

This guide explains how to set up and run the complete AffirmAI stack: **Backend (FastAPI)** and **Frontend (React/Vite)**.

## 📋 Prerequisites
- **Python 3.10+** (for Backend)
- **Node.js 18+** & **npm** (for Frontend)
- **Hugging Face API Token** (for AI generation)

---

## 🐍 1. Backend Setup (on Terminal 1)

**Directory:** `/Users/suthikshaaghoram/AfflimAI/affirmai-backend`

1.  **Navigate to the backend directory**:
    ```bash
    cd affirmai-backend
    ```

2.  **Create and Activate Virtual Environment** (if not already done):
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment**:
    Ensure `.env` exists with your Hugging Face key:
    ```env
    HUGGINGFACE_API_KEY=hf_your_token_here
    MODEL_ID=deepseek-ai/DeepSeek-V3.2
    ```

5.  **Start the Server**:
    ```bash
    uvicorn app.main:app --reload
    ```
    ✅ **Success**: You should see `Application startup complete` running on `http://0.0.0.0:8000`.

---

## ⚛️ 2. Frontend Setup (on Terminal 2)

**Directory:** `/Users/suthikshaaghoram/AfflimAI/frontend`

1.  **Navigate to the frontend directory**:
    ```bash
    cd ../frontend
    ```
    *(Assuming you are starting from backend folder)*

2.  **Install Dependencies**:
    ```bash
    npm install
    # or
    npm ci
    ```

3.  **Start the Development Server**:
    ```bash
    npm run dev
    ```
    ✅ **Success**: You should see `Local: http://localhost:5173/`.

---

## 🔗 3. Verify Integration

1.  Open your browser to **[http://localhost:5173](http://localhost:5173)**.
2.  Fill out the **Manifestation Form**.
3.  Click **"Generate My Manifestation"**.
    - *Check Backend Terminal*: You should see `INFO: Received manifestation request...`.
4.  Once text appears, click the **Audio/Voice** button.
    - *Check Backend Terminal*: You should see `INFO: Generating audio...`.
5.  Listen to the generated audio! 🎧

---

## 🐞 Troubleshooting

- **CORS Error?**: Ensure Backend is running on port `8000` and Frontend on `5173`. The backend is configured to allow all origins (`*`) for development.
- **"Fetch Error"?**: Ensure the Backend server is actually running.
- **Audio not playing?**: Check `outputs/` folder in backend to ensure files are being generated.
