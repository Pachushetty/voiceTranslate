from fastapi import HTTPException
LANGS = {"en":"English","hi":"Hindi","kn":"Kannada","ta":"Tamil","te":"Telugu","ml":"Malayalam","mr":"Marathi","bn":"Bengali","gu":"Gujarati","pa":"Punjabi","ur":"Urdu","es":"Spanish","fr":"French","de":"German","ja":"Japanese","zh-CN":"Chinese","ar":"Arabic","ru":"Russian"}
def check_lang(code):
    if code not in LANGS: raise HTTPException(400, f"Unsupported language: {code}")
def image_mime(data: bytes):
    if data.startswith(b"\xff\xd8\xff"): return "image/jpeg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"): return "image/png"
    if data[:4]==b"RIFF" and data[8:12]==b"WEBP": return "image/webp"
    raise HTTPException(400, "Unsupported image. Use JPEG, PNG or WebP.")
