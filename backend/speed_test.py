import time, os
from dotenv import load_dotenv
load_dotenv(".env", override=True)
from app.services import gemini_service as g

for model in ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"]:
    os.environ["GEMINI_MODEL"] = model
    os.environ["GEMINI_FALLBACK_MODELS"] = ""
    t = time.time()
    try:
        out = g.translate("Hello, how are you?", "English", "Hindi")
    except Exception as e:
        out = "FAILED: " + str(e)[:80]
    print(f"{model}: {time.time() - t:.1f}s -> {out}")