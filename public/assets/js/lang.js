async function loadLanguage(lang) {
  const res = await fetch(`../lang/${lang}.json`);
  if (!res.ok) {
    console.error(`Failed to load language file: ${lang}.json`);
    return;
  }
  const translations = await res.json();

  document
    .querySelectorAll("[data-i18n] , [data-i18n-placeholder]")
    .forEach((el) => {
      const textkey = el.dataset.i18n;
      const placeholderkey = el.dataset.i18nPlaceholder;
      if (translations[textkey]) {
        el.textContent = translations[textkey];
      }
      if (translations[placeholderkey]) {
        el.placeholder = translations[placeholderkey];
      }
    });

  localStorage.setItem("lang", lang);
}
