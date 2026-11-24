import hashlib, secrets, bcrypt
from datetime import datetime, timedelta
from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import AuthSession
def hash_password(p): return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()
def verify_password(p, h): return bcrypt.checkpw(p.encode(), h.encode())
def hash_token(t): return hashlib.sha256(t.encode()).hexdigest()
def create_session(db, user, hours=24):
    raw = secrets.token_urlsafe(32)
    db.add(AuthSession(user_id=user.id, token_hash=hash_token(raw), expires_at=datetime.utcnow()+timedelta(hours=hours)))
    db.commit()
    return raw
def current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing bearer token")
    s = db.query(AuthSession).filter_by(token_hash=hash_token(authorization[7:])).first()
    if not s or s.expires_at < datetime.utcnow():
        raise HTTPException(401, "Session expired or invalid")
    return s.user
