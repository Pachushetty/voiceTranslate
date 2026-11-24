# VoiceTranslate
Voice, text, image and two-person translation. React + Vite frontend, FastAPI + SQLite backend.

## Run the backend
    cd backend
    python -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    cp .env.example .env      # set GEMINI_API_KEY and SECRET_KEY
    uvicorn app.main:app --reload --port 8000
API docs: http://localhost:8000/docs. Optional Whisper fallback: `pip install openai-whisper` (needs ffmpeg).

## Run the frontend
    cd frontend
    cp .env.example .env      # VITE_API_URL, optional VITE_GOOGLE_CLIENT_ID
    npm install && npm run dev    # http://localhost:5173
Use Chrome or Edge; the microphone needs localhost or HTTPS.

## Tests
    cd backend && pytest -q tests     # 16 tests, providers mocked
    cd frontend && npm test             # 4 tests

## Google sign-in (optional)
Create an OAuth Web client in Google Cloud, add http://localhost:5173 as an authorised JavaScript origin,
put the client ID in backend GOOGLE_CLIENT_ID and frontend VITE_GOOGLE_CLIENT_ID.

## Design notes
- Providers: Gemini first, Whisper (speech) / Google Translate (text) as fallback. If all fail, the API returns an error rather than fake output.
- Conversation mode is turn-by-turn, not live streaming.
- Passwords are bcrypt-hashed; session tokens are stored only as SHA-256 hashes.
- Known limits: generated audio older than 24 h is deleted automatically; password reset needs SMTP settings in .env.
