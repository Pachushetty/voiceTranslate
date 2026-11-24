import time, os
from dotenv import load_dotenv
load_dotenv(".env", override=True)
from app.services import gemini_service as g

t = time.time()
try:
    print("Gemini translate:", g.translate("Hello, how are you?", "English", "Hindi"))
except Exception as e:
    print("Gemini failed:", e)
print("Took %.1f seconds" % (time.time() - t))

t = time.time()
try:
    import whisper
    whisper.load_model(os.getenv("WHISPER_MODEL", "base"))
    print("Whisper model loaded OK")
except Exception as e:
    print("Whisper failed:", type(e).__name__, e)
print("Took %.1f seconds" % (time.time() - t))