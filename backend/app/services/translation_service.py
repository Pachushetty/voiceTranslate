from . import gemini_service as g
from ..utils.validators import LANGS
from .gemini_service import ProviderError
def translate_text(text, src, tgt):
    try: return g.translate(text, LANGS.get(src, src), LANGS[tgt]), "gemini"
    except ProviderError: pass
    try:
        from deep_translator import GoogleTranslator
        return GoogleTranslator(source=src, target=tgt).translate(text), "google-translate"
    except Exception: raise ProviderError("All translation providers failed")
