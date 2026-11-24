import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
load_dotenv()
from .database import Base, engine
from .models import user  # noqa
from .routes import auth, speech, translation, vision, history
Base.metadata.create_all(engine)
app = FastAPI(title="VoiceTranslate API")
app.add_middleware(CORSMiddleware, allow_origins=[os.getenv("FRONTEND_URL","http://localhost:5173")], allow_methods=["*"], allow_headers=["*"])
os.makedirs("outputs", exist_ok=True)
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")
for r in (auth, speech, translation, vision, history): app.include_router(r.router)
