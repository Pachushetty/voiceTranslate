import os, secrets, requests
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User, AuthSession
from ..utils.security import *
router = APIRouter(prefix="/auth", tags=["auth"])
class Reg(BaseModel):
    full_name: str = Field(min_length=1, max_length=100)
    username: str = Field(min_length=3, max_length=50, pattern=r"^[A-Za-z0-9_.]+$")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
class Login(BaseModel):
    identifier: str
    password: str
def out(u): return {"id":u.id,"username":u.username,"email":u.email,"full_name":u.full_name,"preferred_language":u.preferred_language}
@router.post("/register", status_code=201)
def register(b: Reg, db: Session = Depends(get_db)):
    if db.query(User).filter((User.username==b.username)|(User.email==b.email.lower())).first():
        raise HTTPException(409, "Username or email already registered")
    u = User(full_name=b.full_name, username=b.username, email=b.email.lower(), password_hash=hash_password(b.password))
    db.add(u); db.commit()
    return {"token": create_session(db, u), "user": out(u)}
@router.post("/login")
def login(b: Login, db: Session = Depends(get_db)):
    u = db.query(User).filter((User.username==b.identifier)|(User.email==b.identifier.lower())).first()
    if not u or not verify_password(b.password, u.password_hash): raise HTTPException(401, "Invalid credentials")
    return {"token": create_session(db, u), "user": out(u)}
@router.get("/me")
def me(u: User = Depends(current_user)): return out(u)
@router.post("/logout")
def logout(authorization: str = Header(None), u: User = Depends(current_user), db: Session = Depends(get_db)):
    db.query(AuthSession).filter_by(token_hash=hash_token(authorization[7:])).delete(); db.commit()
    return {"ok": True}
class GoogleIn(BaseModel):
    credential: str
@router.post("/google")
def google(b: GoogleIn, db: Session = Depends(get_db)):
    cid = os.getenv("GOOGLE_CLIENT_ID")
    if not cid: raise HTTPException(503, "Google sign-in is not configured")
    try:
        r = requests.get("https://oauth2.googleapis.com/tokeninfo", params={"id_token": b.credential}, timeout=10)
        info = r.json() if r.status_code == 200 else None
    except Exception: info = None
    if not info or info.get("aud") != cid or str(info.get("email_verified")).lower() != "true":
        raise HTTPException(401, "Google sign-in could not be verified")
    email = info["email"].lower()
    u = db.query(User).filter_by(email=email).first()
    if not u:
        base = "".join(ch for ch in email.split("@")[0] if ch.isalnum() or ch in "_.")[:40] or "user"
        name = base
        while db.query(User).filter_by(username=name).first(): name = f"{base}{secrets.randbelow(9999)}"
        u = User(full_name=info.get("name", ""), username=name, email=email, password_hash=hash_password(secrets.token_urlsafe(24)))
        db.add(u); db.commit()
    return {"token": create_session(db, u), "user": out(u)}
from datetime import datetime, timedelta
from ..models.user import PasswordReset
from ..services import email_service
class ForgotIn(BaseModel):
    email: EmailStr
class ResetIn(BaseModel):
    token: str
    password: str = Field(min_length=8, max_length=128)
@router.post("/forgot")
def forgot(b: ForgotIn, db: Session = Depends(get_db)):
    u = db.query(User).filter_by(email=b.email.lower()).first()
    if u:
        raw = secrets.token_urlsafe(32)
        db.add(PasswordReset(user_id=u.id, token_hash=hash_token(raw), expires_at=datetime.utcnow() + timedelta(minutes=30))); db.commit()
        link = f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/reset-password?token={raw}"
        try: email_service.send(u.email, "Reset your VoiceTranslate password", f"Use this link within 30 minutes:\n{link}\n\nIgnore this email if you did not ask for it.")
        except email_service.EmailNotConfigured as e: raise HTTPException(503, str(e))
        except Exception: raise HTTPException(502, "Could not send the email. Try again later.")
    return {"message": "If that email is registered, a reset link has been sent."}
@router.post("/reset")
def reset(b: ResetIn, db: Session = Depends(get_db)):
    r = db.query(PasswordReset).filter_by(token_hash=hash_token(b.token)).first()
    if not r or r.used or r.expires_at < datetime.utcnow(): raise HTTPException(400, "This reset link is invalid or has expired")
    u = db.get(User, r.user_id); u.password_hash = hash_password(b.password); r.used = 1
    db.query(AuthSession).filter_by(user_id=u.id).delete(); db.commit()
    return {"ok": True}
