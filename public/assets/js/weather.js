import { getCurrentLanguage, t } from "./lang.js";

const CACHE_TTL = 10 * 60 * 1000;
const cache = new Map();
const chartInstances = new Map();

export const cities = ["Goma", "Kinshasa", "Bukavu", "Kindu", "Lubumbashi"];

const weatherIcons = {
  Clear: "fa-sun",
  Clouds: "fa-cloud",
  Rain: "fa-cloud-rain",
  Thunderstorm: "fa-bolt",
  Snow: "fa-snowflake",
  Mist: "fa-smog",
  Fog: "fa-smog",
  Drizzle: "fa-cloud-rain",
};

export function getWeatherIcon(condition) {
  return weatherIcons[condition] || "fa-cloud-sun";
}

export function isAllowedCity(city) {
  return cities.some((item) => item.toLowerCase() === city.trim().toLowerCase());
}

export function normalizeCity(city) {
  return cities.find((item) => item.toLowerCase() === city.trim().toLowerCase());
}

function cacheKey(type, city, lang) {
  return `${type}:${city.toLowerCase()}:${lang}`;
}

function getCached(type, city, lang) {
  const key = cacheKey(type, city, lang);
  const entry = cache.get(key);

  if (!entry || Date.now() - entry.createdAt > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCached(type, city, lang, data) {
  cache.set(cacheKey(type, city, lang), {
    createdAt: Date.now(),
    data,
  });
}

async function fetchJson(type, city) {
  const lang = getCurrentLanguage();
  const cached = getCached(type, city, lang);

  if (cached) {
    return cached;
  }

  const res = await fetch(
    `../api/${type}.php?city=${encodeURIComponent(city)}&lang=${encodeURIComponent(lang)}`,
  );

  if (!res.ok) {
    throw new Error(type === "weather" ? "invalid_city" : "network_error");
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error);
  }

  setCached(type, city, lang, data);
  return data;
}

export function getSelectedCity() {
  return localStorage.getItem("selectedCity") || cities[0];
}

export function setSelectedCity(city) {
  const normalized = normalizeCity(city);

  if (!normalized) {
    throw new Error("invalid_city");
  }

  localStorage.setItem("selectedCity", normalized);
  document.dispatchEvent(
    new CustomEvent("city:changed", { detail: { city: normalized } }),
  );
  return normalized;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value, options) {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat(getCurrentLanguage(), options).format(date);
}

function showLoading(target) {
  if (target) {
    target.innerHTML = `<p class="card-muted">${escapeHtml(t("loading"))}</p>`;
  }
}

function showError(target, error) {
  if (target) {
    target.innerHTML = `<p class="card-muted">${escapeHtml(t(error.message || "network_error"))}</p>`;
  }
}

function iconHtml(condition) {
  return `<i class="fa-solid ${getWeatherIcon(condition)}"></i>`;
}

async function loadWeather(city) {
  return fetchJson("weather", city);
}

async function loadForecast(city) {
  return fetchJson("forecasts", city);
}

export async function renderTodayPage(city = getSelectedCity()) {
  const mainCard = document.querySelector(".main-1");
  const hourlyCard = document.querySelector(".main-2");
  const detailsCard = document.querySelector(".auxi-1");
  const locationCard = document.querySelector(".auxi-2");

  if (!mainCard) {
    return;
  }

  [mainCard, hourlyCard, detailsCard, locationCard].forEach(showLoading);

  try {
    const [weather, forecast] = await Promise.all([
      loadWeather(city),
      loadForecast(city),
    ]);

    mainCard.innerHTML = `
      <div class="weather-current">
        <div>
          <p class="card-label">${escapeHtml(t("current_weather"))}</p>
          <h1>${escapeHtml(weather.city)}, ${escapeHtml(weather.country)}</h1>
          <p class="card-muted">${escapeHtml(formatDate(new Date(), {
            weekday: "long",
            hour: "2-digit",
            minute: "2-digit",
          }))}</p>
        </div>
        <span class="weather-main-icon">${iconHtml(weather.condition)}</span>
      </div>
      <p class="weather-temp">${Math.round(weather.temperature)}&deg;C</p>
      <p class="weather-condition">${escapeHtml(weather.description || weather.condition)}</p>
      <p class="card-muted">${escapeHtml(formatDate(new Date(), {
        weekday: "long",
        month: "long",
        day: "numeric",
      }))}</p>
    `;

    hourlyCard.innerHTML = `
      <h3>${escapeHtml(t("hourly_forecast"))}</h3>
      <div class="hourly-list">
        ${forecast.hourly
          .slice(0, 6)
          .map(
            (item) => `
              <div class="hourly-item">
                <span>${escapeHtml(formatDate(item.time, { hour: "2-digit" }))}</span>
                ${iconHtml(item.condition)}
                <strong>${Math.round(item.temperature)}&deg;</strong>
              </div>
            `,
          )
          .join("")}
      </div>
    `;

    detailsCard.innerHTML = `
      <h3>${escapeHtml(t("weather_details"))}</h3>
      <div class="detail-grid">
        <div class="detail-item"><span>${escapeHtml(t("humidity"))}</span><strong>${weather.humidity}%</strong></div>
        <div class="detail-item"><span>${escapeHtml(t("wind"))}</span><strong>${weather.wind} m/s</strong></div>
        <div class="detail-item"><span>${escapeHtml(t("pressure"))}</span><strong>${weather.pressure} hPa</strong></div>
      </div>
    `;

    locationCard.innerHTML = `
      <h3>${escapeHtml(t("location"))}</h3>
      <p class="card-muted">${escapeHtml(t("coordinates"))}</p>
      <div class="detail-grid">
        <div class="detail-item"><span>Lat</span><strong>${Number(weather.lat).toFixed(4)}</strong></div>
        <div class="detail-item"><span>Lon</span><strong>${Number(weather.lon).toFixed(4)}</strong></div>
      </div>
    `;
  } catch (error) {
    [mainCard, hourlyCard, detailsCard, locationCard].forEach((target) =>
      showError(target, error),
    );
  }
}

export async function renderForecastPage(city = getSelectedCity()) {
  const forecastGrid = document.querySelector(".forecast-1");
  const cityCard = document.querySelector(".cityContainer");
  const dayCards = [...document.querySelectorAll(".dayContainer")];
  const chartArea = document.querySelector(".forecast-2");

  if (!forecastGrid || !cityCard) {
    return;
  }

  [cityCard, ...dayCards, chartArea].forEach(showLoading);

  try {
    const [weather, forecast] = await Promise.all([
      loadWeather(city),
      loadForecast(city),
    ]);

    cityCard.innerHTML = `
      <p class="card-label">${escapeHtml(t("current_weather"))}</p>
      <div class="forecast-card-top">
        <h2>${escapeHtml(weather.city)}, ${escapeHtml(weather.country)}</h2>
        ${iconHtml(weather.condition)}
      </div>
      <p class="forecast-temp">${Math.round(weather.temperature)}&deg;C</p>
      <p class="card-muted">${escapeHtml(weather.description || weather.condition)}</p>
    `;

    forecast.daily.slice(0, 7).forEach((item, index) => {
      if (!dayCards[index]) {
        return;
      }

      dayCards[index].innerHTML = `
        <div class="forecast-card-top">
          <h3>${escapeHtml(formatDate(item.date, { weekday: "short" }))}</h3>
          ${iconHtml(item.condition)}
        </div>
        <p class="forecast-temp">${Math.round(item.tempMax)}&deg;C</p>
        <p class="card-muted">${escapeHtml(item.description || item.condition)}</p>
        <p class="forecast-range">${Math.round(item.tempMin)}&deg; / ${item.rainProbability || 0}%</p>
      `;
    });

    renderCharts(chartArea, forecast.daily.slice(0, 7));
  } catch (error) {
    [cityCard, ...dayCards, chartArea].forEach((target) => showError(target, error));
  }
}

async function ensureScript(src, globalName) {
  if (window[globalName]) {
    return window[globalName];
  }

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return window[globalName];
}

async function ensureStyle(href) {
  if ([...document.styleSheets].some((sheet) => sheet.href === href)) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

async function renderCharts(target, daily) {
  if (!target) {
    return;
  }

  target.innerHTML = `
    <div class="chart-card">
      <h3>${escapeHtml(t("temperature_trend"))}</h3>
      <canvas id="temperatureChart" aria-label="${escapeHtml(t("temperature_trend"))}"></canvas>
    </div>
    <div class="chart-card">
      <h3>${escapeHtml(t("rain_probability"))}</h3>
      <canvas id="rainChart" aria-label="${escapeHtml(t("rain_probability"))}"></canvas>
    </div>
  `;

  try {
    const Chart = await ensureScript(
      "https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js",
      "Chart",
    );
    const labels = daily.map((item) => formatDate(item.date, { weekday: "short" }));

    chartInstances.forEach((chart) => chart.destroy());
    chartInstances.clear();

    chartInstances.set(
      "temperature",
      new Chart(document.getElementById("temperatureChart"), {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: t("temperature_trend"),
              data: daily.map((item) => Math.round(item.tempMax)),
              borderColor: "#56d6c9",
              backgroundColor: "rgba(86, 214, 201, 0.16)",
              tension: 0.35,
              fill: true,
            },
          ],
        },
        options: chartOptions(),
      }),
    );

    chartInstances.set(
      "rain",
      new Chart(document.getElementById("rainChart"), {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: t("rain_probability"),
              data: daily.map((item) => item.rainProbability || 0),
              backgroundColor: "rgba(247, 191, 95, 0.68)",
            },
          ],
        },
        options: chartOptions(),
      }),
    );
  } catch {
    target.innerHTML = `<p>${escapeHtml(t("network_error"))}</p>`;
  }
}

function chartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#f8fbfb" },
      },
    },
    scales: {
      x: { ticks: { color: "#b8c6c7" }, grid: { color: "rgba(255,255,255,.08)" } },
      y: { ticks: { color: "#b8c6c7" }, grid: { color: "rgba(255,255,255,.08)" } },
    },
  };
}

export async function renderMapPage(city = getSelectedCity()) {
  const mapCard = document.querySelector("#weatherMap");
  const coordsCard = document.querySelector("#mapCoordinates");

  if (!mapCard) {
    return;
  }

  showLoading(coordsCard);

  try {
    const weather = await loadWeather(city);
    await ensureStyle("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
    const L = await ensureScript(
      "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
      "L",
    );

    mapCard.style.minHeight = "420px";
    mapCard.style.borderRadius = "8px";
    mapCard.style.overflow = "hidden";

    if (!window.weatherMapInstance) {
      window.weatherMapInstance = L.map(mapCard).setView([weather.lat, weather.lon], 10);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(window.weatherMapInstance);
    } else {
      window.weatherMapInstance.setView([weather.lat, weather.lon], 10);
    }

    if (window.weatherMapMarker) {
      window.weatherMapMarker.remove();
    }

    window.weatherMapMarker = L.marker([weather.lat, weather.lon])
      .addTo(window.weatherMapInstance)
      .bindPopup(`${weather.city}, ${weather.country}`)
      .openPopup();

    coordsCard.innerHTML = `
      <h2>${escapeHtml(weather.city)}</h2>
      <p>Lat: ${Number(weather.lat).toFixed(4)}</p>
      <p>Lon: ${Number(weather.lon).toFixed(4)}</p>
    `;
  } catch (error) {
    showError(coordsCard, error);
  }
}

export async function renderAlertsPage(city = getSelectedCity()) {
  const target = document.querySelector("#weatherAlerts");

  if (!target) {
    return;
  }

  showLoading(target);

  try {
    const data = await fetchJson("alerts", city);

    if (!data.alerts || data.alerts.length === 0) {
      target.innerHTML = `
        <p class="card-label">${escapeHtml(t("alerts"))}</p>
        <h2>${escapeHtml(data.city || city)}</h2>
        <p class="card-muted">${escapeHtml(t("no_alerts"))}</p>
      `;
      return;
    }

    target.innerHTML = data.alerts
      .map(
        (alert) => `
          <article>
            <h3>${escapeHtml(alert.event)}</h3>
            <p>${escapeHtml(alert.description)}</p>
          </article>
        `,
      )
      .join("");
  } catch (error) {
    showError(target, error);
  }
}

export async function renderCurrentPage(city = getSelectedCity()) {
  await Promise.all([
    renderTodayPage(city),
    renderForecastPage(city),
    renderMapPage(city),
    renderAlertsPage(city),
  ]);
}
