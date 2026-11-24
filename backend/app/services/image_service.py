from . import gemini_service as g
from ..utils.validators import image_mime
from fastapi import HTTPException
def extract(data):
    if len(data) > 10*1024*1024: raise HTTPException(413, "Image exceeds 10 MB")
    text = g.extract_text(data, image_mime(data))
    if not text or text.strip()=="NO_TEXT": raise HTTPException(422, "No readable text found in image")
    return text
