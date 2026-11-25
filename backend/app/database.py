import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
URL = os.getenv("DATABASE_URL", "sqlite:///./voice.db")

try:
    engine = create_engine(URL, connect_args={"check_same_thread": False} if URL.startswith("sqlite") else {})
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    print(f"[DB Warning] Could not connect to {URL}, falling back to local SQLite: {e}")
    URL = "sqlite:///./voice.db"
    engine = create_engine(URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()
def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()
