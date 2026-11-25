import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
load_dotenv()
from .database import Base, engine
from .models import user  # noqa
from .routes import auth, speech, translation, vision, history

try:
    Base.metadata.create_all(engine)
except Exception as e:
    print(f"[DB Warning] Could not initialize database tables: {e}")

app = FastAPI(title="VoiceTranslate API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OUTPUTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "outputs"))
os.makedirs(OUTPUTS_DIR, exist_ok=True)
app.mount("/outputs", StaticFiles(directory=OUTPUTS_DIR), name="outputs")

for r in (auth, speech, translation, vision, history):
    app.include_router(r.router)
