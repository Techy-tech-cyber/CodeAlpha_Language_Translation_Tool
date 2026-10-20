from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import httpx

app = FastAPI(title="Lingua Translator API", version="1.0.0")

# For local development. In production, serve the frontend from the same domain
# or restrict this list to your deployed frontend URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

LANGUAGES = {
    "English": "en",
    "Hindi": "hi",
    "French": "fr",
    "Spanish": "es",
    "German": "de",
    "Italian": "it",
    "Portuguese": "pt",
    "Russian": "ru",
    "Japanese": "ja",
    "Korean": "ko",
    "Chinese": "zh-CN",
    "Arabic": "ar",
    "Bengali": "bn",
    "Punjabi": "pa",
    "Urdu": "ur",
}

class TranslationRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    source: str
    target: str

@app.get("/api/languages")
def languages():
    return {"languages": list(LANGUAGES.keys())}

@app.post("/api/translate")
async def translate(request: TranslationRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Please enter text to translate.")
    if request.source not in LANGUAGES or request.target not in LANGUAGES:
        raise HTTPException(status_code=400, detail="Unsupported language selected.")
    if request.source == request.target:
        return {"translated_text": text, "source": request.source, "target": request.target}

    # MyMemory provides a simple demo translation endpoint. It has usage limits
    # and may not be suitable for production or confidential text.
    params = {
        "q": text,
        "langpair": f"{LANGUAGES[request.source]}|{LANGUAGES[request.target]}",
    }
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get("https://api.mymemory.translated.net/get", params=params)
            response.raise_for_status()
            data = response.json()
        translated = data.get("responseData", {}).get("translatedText")
        if not translated:
            raise HTTPException(status_code=502, detail="The translation service returned no translation.")
        if data.get("responseStatus", 200) not in (200, "200"):
            raise HTTPException(status_code=502, detail="Translation service could not translate this text.")
        return {
            "translated_text": translated,
            "source": request.source,
            "target": request.target,
        }
    except HTTPException:
        raise
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Translation service timed out. Please try again.")
    except (httpx.HTTPError, ValueError):
        raise HTTPException(status_code=502, detail="Could not connect to the translation service. Please try again.")

app.mount("/", StaticFiles(directory="static", html=True), name="static")
