import tempfile, os
from .gemini_service import ProviderError
def transcribe(audio, suffix=".webm", language=None):
    try: import whisper
    except ImportError: raise ProviderError("Whisper not installed")
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as f:
        f.write(audio); path = f.name
    try: return whisper.load_model(os.getenv("WHISPER_MODEL", "base")).transcribe(path, language=language)["text"].strip()
    except Exception as e: raise ProviderError(f"Whisper failed: {type(e).__name__}")
    finally: os.unlink(path)
