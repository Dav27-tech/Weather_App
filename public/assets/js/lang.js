let currentTranslations = {};

export async function loadLanguage(lang) {
  const selectedLang = ["en", "fr"].includes(lang) ? lang : "en";
  const res = await fetch(`../lang/${selectedLang}.json`);

  if (!res.ok) {
    console.error(`Failed to load language file: ${selectedLang}.json`);
    return currentTranslations;
  }

  currentTranslations = await res.json();

  document
    .querySelectorAll("[data-i18n], [data-i18n-placeholder]")
    .forEach((el) => {
      const textKey = el.dataset.i18n;
      const placeholderKey = el.dataset.i18nPlaceholder;

      if (textKey && currentTranslations[textKey]) {
        el.textContent = currentTranslations[textKey];
      }

      if (placeholderKey && currentTranslations[placeholderKey]) {
        el.placeholder = currentTranslations[placeholderKey];
      }
    });

  localStorage.setItem("lang", selectedLang);
  document.dispatchEvent(
    new CustomEvent("language:changed", {
      detail: { lang: selectedLang, translations: currentTranslations },
    }),
  );

  return currentTranslations;
}

export function getCurrentLanguage() {
  return localStorage.getItem("lang") || "en";
}

export function t(key) {
  return currentTranslations[key] || key;
}
