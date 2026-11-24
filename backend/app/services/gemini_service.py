import os, time, base64, requests
class ProviderError(Exception): pass
RETRY = (429, 500, 502, 503, 504)
def _models():
    first = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    extra = [m.strip() for m in os.getenv("GEMINI_FALLBACK_MODELS", "").split(",") if m.strip()]
    return [first] + [m for m in extra if m != first]
def _call(parts):
    key = os.getenv("GEMINI_API_KEY")
    if not key: raise ProviderError("GEMINI_API_KEY not set")
    last = "no attempt made"
    for model in _models():
        for attempt in range(2):
            try:
                r = requests.post(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                    params={"key": key}, json={"contents": [{"parts": parts}]}, timeout=45)
            except Exception as e:
                last = f"Gemini request failed: {type(e).__name__}"; time.sleep(1.5 * (attempt + 1)); continue
            if r.status_code == 200:
                try: return r.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                except Exception: raise ProviderError("Gemini returned no text")
            try: msg = r.json()["error"]["message"][:140]
            except Exception: msg = "no details"
            last = f"Gemini {r.status_code} (model {model}): {msg}"
            if r.status_code not in RETRY: break
            time.sleep(2 * (attempt + 1))
    raise ProviderError(last)
def _b64(b): return base64.b64encode(b).decode()
def transcribe(audio, mime, lang_name):
    return _call([{"text": f"Transcribe this {lang_name} speech exactly. Return only the transcription."}, {"inline_data": {"mime_type": mime, "data": _b64(audio)}}])
def translate(text, src_name, tgt_name):
    return _call([{"text": f"Translate from {src_name} to {tgt_name}. Return only the translation, no explanation.\n\n{text}"}])
def extract_text(img, mime):
    return _call([{"text": "Extract all visible text from this image. Return only the text. If none, return NO_TEXT."}, {"inline_data": {"mime_type": mime, "data": _b64(img)}}])
