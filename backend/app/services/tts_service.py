import uuid, os, time
MAX_AGE = 24 * 3600
def cleanup(folder="outputs", max_age=MAX_AGE):
    n = 0
    if not os.path.isdir(folder): return 0
    for f in os.listdir(folder):
        p = os.path.join(folder, f)
        if f.endswith(".mp3") and time.time() - os.path.getmtime(p) > max_age:
            try: os.remove(p); n += 1
            except OSError: pass
    return n
def speak(text, lang):
    try:
        from gtts import gTTS
        os.makedirs("outputs", exist_ok=True); cleanup()
        name = f"{uuid.uuid4().hex}.mp3"
        gTTS(text=text, lang=lang).save(os.path.join("outputs", name))
        return f"/outputs/{name}"
    except Exception: return None
