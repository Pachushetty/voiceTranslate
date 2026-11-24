import os
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app
from app.services.gemini_service import ProviderError
c = TestClient(app)
def auth():
    c.post("/auth/register", json={"full_name":"T","username":"tester","email":"t@x.com","password":"password1"})
    t = c.post("/auth/login", json={"identifier":"tester","password":"password1"}).json()["token"]
    return {"Authorization": f"Bearer {t}"}
def test_auth_required(): assert c.get("/auth/me").status_code == 401
def test_register_login_me(): assert c.get("/auth/me", headers=auth()).json()["username"] == "tester"
def test_bad_login(): assert c.post("/auth/login", json={"identifier":"tester","password":"wrong"}).status_code == 401
def test_translation_and_history():
    h = auth()
    with patch("app.services.gemini_service.translate", return_value="hola"), patch("app.services.tts_service.speak", return_value=None):
        r = c.post("/translation", json={"text":"hello","source_language":"en","target_language":"es"}, headers=h)
    assert r.json()["translated_text"] == "hola"
    assert len(c.get("/history", headers=h).json()) >= 1
def test_fallback():
    h = auth()
    with patch("app.services.gemini_service.translate", side_effect=ProviderError("x")), patch("deep_translator.GoogleTranslator.translate", return_value="bonjour"), patch("app.services.tts_service.speak", return_value=None):
        r = c.post("/translation", json={"text":"hello","source_language":"en","target_language":"fr"}, headers=h)
    assert r.json()["provider"] == "google-translate"
def test_bad_image():
    r = c.post("/vision", files={"image":("a.png", b"notimage", "image/png")}, data={"target_language":"hi"}, headers=auth())
    assert r.status_code == 400
def _audio(): return {"audio": ("r.webm", b"fakeaudio", "audio/webm")}
def test_speech_gemini():
    h = auth()
    with patch("app.services.gemini_service.transcribe", return_value="hello"), patch("app.services.gemini_service.translate", return_value="namaste"), patch("app.services.tts_service.speak", return_value="/outputs/x.mp3"):
        r = c.post("/speech", files=_audio(), data={"source_language":"en","target_language":"hi"}, headers=h)
    assert r.status_code == 200 and r.json()["transcription_provider"] == "gemini" and r.json()["translated_text"] == "namaste"
def test_speech_whisper_fallback():
    h = auth()
    with patch("app.services.gemini_service.transcribe", side_effect=ProviderError("x")), patch("app.services.whisper_service.transcribe", return_value="hi there"), patch("app.services.gemini_service.translate", return_value="hola"), patch("app.services.tts_service.speak", return_value=None):
        r = c.post("/speech", files=_audio(), data={"source_language":"en","target_language":"es"}, headers=h)
    assert r.json()["transcription_provider"] == "whisper"
def test_speech_all_asr_fail():
    with patch("app.services.gemini_service.transcribe", side_effect=ProviderError("x")), patch("app.services.whisper_service.transcribe", side_effect=ProviderError("y")):
        r = c.post("/speech", files=_audio(), data={"source_language":"en","target_language":"es"}, headers=auth())
    assert r.status_code == 502
def test_speech_bad_format():
    r = c.post("/speech", files={"audio":("a.txt", b"x", "text/plain")}, data={"source_language":"en","target_language":"es"}, headers=auth())
    assert r.status_code == 415
def test_settings_update():
    h = auth(); assert c.put("/settings", json={"preferred_language":"kn"}, headers=h).status_code == 200
    assert c.get("/settings", headers=h).json()["preferred_language"] == "kn"
PNG = b"\x89PNG\r\n\x1a\n" + b"0"*20
def test_vision_extract_and_translate():
    h = auth()
    with patch("app.services.gemini_service.extract_text", return_value="STOP"):
        r = c.post("/vision/extract", files={"image":("a.png", PNG, "image/png")}, headers=h)
    assert r.json()["extracted_text"] == "STOP"
    with patch("app.services.gemini_service.extract_text", return_value="NO_TEXT"):
        assert c.post("/vision/extract", files={"image":("a.png", PNG, "image/png")}, headers=h).status_code == 422
    with patch("app.services.gemini_service.translate", return_value="रुको"), patch("app.services.tts_service.speak", return_value=None):
        r = c.post("/translation", json={"text":"STOP","source_language":"en","target_language":"hi","translation_type":"vision"}, headers=h)
    assert c.get("/history?type=vision", headers=h).json()[0]["translated_text"] == "रुको"
def test_google_login():
    class R: status_code = 200; 
    R.json = lambda self: {"aud":"cid","email_verified":"true","email":"g@x.com","name":"G"}
    os.environ["GOOGLE_CLIENT_ID"] = "cid"
    with patch("requests.get", return_value=R()):
        r = c.post("/auth/google", json={"credential":"tok"})
    assert r.status_code == 200 and r.json()["user"]["email"] == "g@x.com"
    R.json = lambda self: {"aud":"other","email_verified":"true","email":"g@x.com"}
    with patch("requests.get", return_value=R()):
        assert c.post("/auth/google", json={"credential":"tok"}).status_code == 401
def test_password_reset_flow():
    import re
    from app.models.user import User
    sent = {}
    c.post("/auth/register", json={"full_name":"R","username":"resetter","email":"r@x.com","password":"oldpassword1"})
    os.environ["SMTP_HOST"] = "h"
    with patch("app.services.email_service.send", side_effect=lambda to, sub, body: sent.update(body=body)):
        assert c.post("/auth/forgot", json={"email":"r@x.com"}).status_code == 200
        assert c.post("/auth/forgot", json={"email":"nobody@x.com"}).status_code == 200
    tok = re.search(r"token=(\S+)", sent["body"]).group(1)
    assert c.post("/auth/reset", json={"token":tok, "password":"newpassword1"}).status_code == 200
    assert c.post("/auth/reset", json={"token":tok, "password":"newpassword2"}).status_code == 400
    assert c.post("/auth/login", json={"identifier":"resetter","password":"newpassword1"}).status_code == 200
    assert c.post("/auth/login", json={"identifier":"resetter","password":"oldpassword1"}).status_code == 401
def test_forgot_without_email_config():
    os.environ.pop("SMTP_HOST", None)
    c.post("/auth/register", json={"full_name":"R","username":"noemail","email":"ne@x.com","password":"password1"})
    assert c.post("/auth/forgot", json={"email":"ne@x.com"}).status_code == 503
def test_audio_cleanup(tmp_path):
    import time
    from app.services.tts_service import cleanup
    old = tmp_path/"old.mp3"; new = tmp_path/"new.mp3"; old.write_bytes(b"x"); new.write_bytes(b"x")
    os.utime(old, (time.time()-90000,)*2)
    assert cleanup(str(tmp_path)) == 1 and new.exists() and not old.exists()
