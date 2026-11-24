from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import TranslationRecord as R
from ..utils.security import current_user
router = APIRouter(tags=["history"])
def ser(r): return {"id":r.id,"source_text":r.source_text,"translated_text":r.translated_text,"source_language":r.source_language,"target_language":r.target_language,"translation_type":r.translation_type,"created_at":r.created_at.isoformat()}
@router.get("/history")
def get_history(q: str = "", type: str = "", limit: int = Query(100, le=500), u=Depends(current_user), db: Session = Depends(get_db)):
    qs = db.query(R).filter(R.user_id==u.id)
    if q: qs = qs.filter(R.source_text.contains(q) | R.translated_text.contains(q))
    if type: qs = qs.filter(R.translation_type==type)
    return [ser(r) for r in qs.order_by(R.created_at.desc()).limit(limit)]
@router.delete("/history/{rid}")
def del_one(rid: int, u=Depends(current_user), db: Session = Depends(get_db)):
    db.query(R).filter_by(id=rid, user_id=u.id).delete(); db.commit(); return {"ok": True}
@router.delete("/history")
def clear(u=Depends(current_user), db: Session = Depends(get_db)):
    db.query(R).filter_by(user_id=u.id).delete(); db.commit(); return {"ok": True}
@router.get("/settings")
def settings(u=Depends(current_user)):
    return {"username":u.username,"email":u.email,"full_name":u.full_name,"preferred_language":u.preferred_language,"app":"VoiceTranslate 1.0"}
from pydantic import BaseModel
from sqlalchemy.orm import Session as _S
from ..utils.validators import check_lang
class SettingsIn(BaseModel):
    preferred_language: str
@router.put("/settings")
def update_settings(b: SettingsIn, u=Depends(current_user), db: _S = Depends(get_db)):
    check_lang(b.preferred_language)
    u.preferred_language = b.preferred_language; db.merge(u); db.commit()
    return {"preferred_language": u.preferred_language}
