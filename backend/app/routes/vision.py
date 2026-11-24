from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services import image_service
from ..services.gemini_service import ProviderError
from ..utils.security import current_user
from .translation import run
router = APIRouter(tags=["vision"])
@router.post("/vision")
async def vision(image: UploadFile = File(...), source_language: str = Form("en"), target_language: str = Form(...),
                 u=Depends(current_user), db: Session = Depends(get_db)):
    try: text = image_service.extract(await image.read())
    except ProviderError as e: raise HTTPException(502, str(e))
    return run(db, u, text, source_language, target_language, "vision")
@router.post("/vision/extract")
async def extract_only(image: UploadFile = File(...), u=Depends(current_user)):
    try: return {"extracted_text": image_service.extract(await image.read())}
    except ProviderError as e: raise HTTPException(502, str(e))
