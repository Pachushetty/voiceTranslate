from starlette.concurrency import run_in_threadpool
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services import gemini_service as g, whisper_service as w
from ..utils.security import current_user
from ..utils.validators import check_lang, LANGS
from .translation import run
router = APIRouter(tags=["speech"])
OK = ("audio/webm","audio/ogg","audio/wav","audio/x-wav","audio/mpeg","audio/mp4","audio/mp3")
@router.post("/speech")
async def speech(audio: UploadFile = File(...), source_language: str = Form(...), target_language: str = Form(...),
                 kind: str = Form("voice"), u=Depends(current_user), db: Session = Depends(get_db)):
    check_lang(source_language); check_lang(target_language)
    mime = (audio.content_type or "").split(";")[0]
    if mime not in OK: raise HTTPException(415, f"Unsupported audio format: {mime}")
    data = await audio.read()
    if not data or len(data) > 20*1024*1024: raise HTTPException(400, "Empty or oversized audio")
    try: text = await run_in_threadpool(g.transcribe, data, mime, LANGS[source_language]); asr = "gemini"
    except g.ProviderError as e1:
        try: text = await run_in_threadpool(w.transcribe, data, ".wav" if "wav" in mime else ".webm", source_language.split("-")[0]); asr = "whisper"
        except g.ProviderError as e: raise HTTPException(502, f"Transcription failed. {e1} | Fallback: {e}")
    if not text: raise HTTPException(422, "No speech detected")
    res = await run_in_threadpool(run, db, u, text, source_language, target_language, kind if kind in ("voice","conversation") else "voice")
    res["transcription_provider"] = asr
    return res
