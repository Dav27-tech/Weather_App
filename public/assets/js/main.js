import { getCurrentLanguage, loadLanguage, t } from "./lang.js";
import {
  cities,
  isAllowedCity,
  normalizeCity,
  renderCurrentPage,
  setSelectedCity,
} from "./weather.js";

const input = document.getElementById("city");
const options = document.getElementById("options");
const btnSearch = document.getElementById("btnSearch");

function hideOptions() {
  options.style.display = "none";
}

function showOptions() {
  options.style.display = "block";
}

function renderSuggestion(label, onClick) {
  const li = document.createElement("li");
  li.textContent = label;
  li.addEventListener("click", onClick);
  options.appendChild(li);
}

function renderSuggestions() {
  const value = input.value.trim().toLowerCase();
  options.innerHTML = "";

  if (!value) {
    hideOptions();
    return;
  }

  const filtered = cities.filter((city) => city.toLowerCase().startsWith(value));
  showOptions();

  if (filtered.length === 0) {
    renderSuggestion(t("no_information"), () => {});
    return;
  }

  filtered.forEach((city) => {
    renderSuggestion(city, () => selectCity(city));
  });
}

async function selectCity(city) {
  try {
    const selectedCity = setSelectedCity(city);
    input.value = selectedCity;
    hideOptions();
    await renderCurrentPage(selectedCity);
  } catch (error) {
    options.innerHTML = "";
    showOptions();
    renderSuggestion(t(error.message || "invalid_city"), () => {});
  }
}

async function verifyCity() {
  const value = input.value.trim();

  if (!value) {
    alert(t("search_empty"));
    return;
  }

  if (!isAllowedCity(value)) {
    options.innerHTML = "";
    showOptions();
    renderSuggestion(t("invalid_city"), () => {});
    return;
  }

  await selectCity(normalizeCity(value));
}

async function init() {
  const langSwitch = document.getElementById("lang_switch");
  const savedLang = getCurrentLanguage();

  await loadLanguage(savedLang);
  langSwitch.value = savedLang;

  input.addEventListener("input", renderSuggestions);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      verifyCity();
    }
  });

  btnSearch.addEventListener("click", verifyCity);

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search_input")) {
      hideOptions();
    }
  });

  langSwitch.addEventListener("change", async () => {
    await loadLanguage(langSwitch.value);
  });

  document.addEventListener("language:changed", () => {
    renderCurrentPage();
  });

  document.addEventListener("city:changed", (event) => {
    input.value = event.detail.city;
  });

  input.value = localStorage.getItem("selectedCity") || cities[0];
  await renderCurrentPage(input.value);
}

document.addEventListener("DOMContentLoaded", init);
