// ===============================
// SIMPLE i18n ENGINE
// ===============================

const DEFAULT_LANG = "en";
const LANG_PATH = "/frontend/lang";

// Get saved language or fallback
let currentLang = localStorage.getItem("lang") || DEFAULT_LANG;

// Load language JSON
async function loadLanguage(lang) {
  try {
    const res = await fetch(`${LANG_PATH}/${lang}.json`);
    const translations = await res.json();
    applyTranslations(translations);
    document.documentElement.lang = lang;
    localStorage.setItem("lang", lang);
  } catch (err) {
    console.error("Failed to load language:", err);
  }
}

// Apply translations to DOM
function applyTranslations(translations) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = key
      .split(".")
      .reduce((obj, i) => (obj ? obj[i] : null), translations);

    if (value) el.textContent = value;
  });
}

// Language switcher
function switchLanguage(lang) {
  currentLang = lang;
  loadLanguage(lang);
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  loadLanguage(currentLang);
});
