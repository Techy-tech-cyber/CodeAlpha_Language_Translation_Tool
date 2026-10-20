const sourceSelect = document.getElementById("source-language");
const targetSelect = document.getElementById("target-language");
const sourceText = document.getElementById("source-text");
const translatedText = document.getElementById("translated-text");
const translateButton = document.getElementById("translate-button");
const copyButton = document.getElementById("copy-button");
const clearButton = document.getElementById("clear-button");
const swapButton = document.getElementById("swap-button");
const charCount = document.getElementById("char-count");
const outputLanguage = document.getElementById("output-language");
const resultStatus = document.getElementById("result-status");
const errorMessage = document.getElementById("error-message");

const languages = [
  "English", "Hindi", "French", "Spanish", "German", "Italian",
  "Portuguese", "Russian", "Japanese", "Korean", "Chinese",
  "Arabic", "Bengali", "Punjabi", "Urdu"
];

function populateLanguages() {
  for (const language of languages) {
    sourceSelect.add(new Option(language, language));
    targetSelect.add(new Option(language, language));
  }
  sourceSelect.value = "English";
  targetSelect.value = "Hindi";
  outputLanguage.textContent = targetSelect.value;
}
populateLanguages();

sourceText.addEventListener("input", () => {
  charCount.textContent = `${sourceText.value.length} / 5000`;
  errorMessage.textContent = "";
});

targetSelect.addEventListener("change", () => {
  outputLanguage.textContent = targetSelect.value;
});

clearButton.addEventListener("click", () => {
  sourceText.value = "";
  translatedText.textContent = "Your translation will appear here.";
  translatedText.classList.add("placeholder");
  charCount.textContent = "0 / 5000";
  copyButton.disabled = true;
  resultStatus.textContent = "Ready to translate";
  errorMessage.textContent = "";
  sourceText.focus();
});

swapButton.addEventListener("click", () => {
  const oldSource = sourceSelect.value;
  sourceSelect.value = targetSelect.value;
  targetSelect.value = oldSource;
  outputLanguage.textContent = targetSelect.value;

  const oldInput = sourceText.value;
  const currentOutput = translatedText.textContent;
  if (currentOutput && !translatedText.classList.contains("placeholder")) {
    sourceText.value = currentOutput;
    translatedText.textContent = oldInput || "Your translation will appear here.";
    translatedText.classList.toggle("placeholder", !oldInput);
    copyButton.disabled = !oldInput;
    charCount.textContent = `${sourceText.value.length} / 5000`;
  }
});

translateButton.addEventListener("click", async () => {
  const text = sourceText.value.trim();
  errorMessage.textContent = "";
  if (!text) {
    errorMessage.textContent = "Please enter some text first.";
    sourceText.focus();
    return;
  }

  translateButton.disabled = true;
  translateButton.querySelector("span:first-child").textContent = "Translating...";
  resultStatus.textContent = "Contacting translation API...";
  copyButton.disabled = true;

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        source: sourceSelect.value,
        target: targetSelect.value
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Translation failed. Please try again.");

    translatedText.textContent = data.translated_text;
    translatedText.classList.remove("placeholder");
    outputLanguage.textContent = targetSelect.value;
    resultStatus.textContent = "Translation complete";
    copyButton.disabled = false;
  } catch (error) {
    errorMessage.textContent = error.message || "Could not reach the API. Is the backend running?";
    resultStatus.textContent = "Translation unsuccessful";
  } finally {
    translateButton.disabled = false;
    translateButton.querySelector("span:first-child").textContent = "Translate text";
  }
});

copyButton.addEventListener("click", async () => {
  const text = translatedText.textContent;
  try {
    await navigator.clipboard.writeText(text);
    copyButton.innerHTML = "<span>✓</span> Copied!";
    resultStatus.textContent = "Copied to clipboard";
    setTimeout(() => {
      copyButton.innerHTML = "<span>▢</span> Copy";
      resultStatus.textContent = "Translation complete";
    }, 1500);
  } catch {
    errorMessage.textContent = "Clipboard access failed. Select and copy the translated text manually.";
  }
});
