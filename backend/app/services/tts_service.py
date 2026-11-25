import uuid, os, time

MAX_AGE = 24 * 3600
OUTPUTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "outputs"))

def cleanup(folder=OUTPUTS_DIR, max_age=MAX_AGE):
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
        os.makedirs(OUTPUTS_DIR, exist_ok=True)
        cleanup(OUTPUTS_DIR)
        name = f"{uuid.uuid4().hex}.mp3"
        tts_lang = lang if lang != "zh" else "zh-CN"
        gTTS(text=text, lang=tts_lang).save(os.path.join(OUTPUTS_DIR, name))
        return f"/outputs/{name}"
    except Exception as ex:
        print(f"[TTS Error] {ex}")
        return None
