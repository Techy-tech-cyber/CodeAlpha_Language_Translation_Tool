# Lingua — Language Translator

A responsive language translator built with HTML, CSS, JavaScript, FastAPI, and the MyMemory translation API.

## Features
- Responsive interface for desktop and mobile
- Source and target language selectors
- Translate button connected to a FastAPI endpoint
- Translation result display
- Copy translation and clear text controls
- Swap languages
- Basic input validation and API error messages

## Run locally

1. Install Python 3.10 or newer.
2. Open a terminal in this project folder.
3. Create and activate a virtual environment (recommended):

   **Windows**
   ```powershell
   py -m venv .venv
   .venv\Scripts\activate
   ```

   **macOS/Linux**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

4. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Start the server:

   ```bash
   uvicorn main:app --reload
   ```

6. Open http://127.0.0.1:8000 in your browser.
7. API docs are available at http://127.0.0.1:8000/docs.

## API example

`POST /api/translate`

```json
{
  "text": "Hello, how are you?",
  "source": "English",
  "target": "Hindi"
}
```

Example response:

```json
{
  "translated_text": "नमस्ते, आप कैसे हैं?",
  "source": "English",
  "target": "Hindi"
}
```

## Important notes
- The app needs an internet connection because the backend calls MyMemory.
- The public translation service has usage limits and its availability/quality can vary.
- Do not send confidential or sensitive text to a public translation service.
- For production, use a supported translation provider with an API key, keep the key in an environment variable on the backend, restrict CORS to your deployed frontend, and add rate limiting.
- When deploying, ensure `main.py`, `requirements.txt`, and the `static/` folder are included.
