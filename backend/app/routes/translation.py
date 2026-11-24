from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import TranslationRecord
from ..services import translation_service as ts, tts_service
from ..services.gemini_service import ProviderError
from ..utils.security import current_user
from ..utils.validators import check_lang
router = APIRouter(tags=["translation"])
class TReq(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    source_language: str
    target_language: str
    translation_type: str = "text"
def run(db, user, text, src, tgt, kind):
    check_lang(src); check_lang(tgt)
    try: tr, provider = ts.translate_text(text, src, tgt)
    except ProviderError as e: raise HTTPException(502, str(e))
    db.add(TranslationRecord(user_id=user.id, source_text=text, translated_text=tr, source_language=src, target_language=tgt, translation_type=kind)); db.commit()
    return {"original_text": text, "translated_text": tr, "provider": provider, "audio_url": tts_service.speak(tr, tgt)}
@router.post("/translation")
def translation(b: TReq, u=Depends(current_user), db: Session = Depends(get_db)):
    return run(db, u, b.text, b.source_language, b.target_language, b.translation_type if b.translation_type in ("text","vision") else "text")
