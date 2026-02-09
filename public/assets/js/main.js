const cities = ["Goma", "Kinshasa", "Bukavu", "Kigali", "Kindu", "Lubumbashi"];
const input = document.getElementById("city");
const options = document.getElementById("options");
const btnSearch = document.getElementById("btnSearch");

input.addEventListener("input", () => {
  const value = input.value.toLowerCase();
  options.innerHTML = "";

  if (!value) {
    options.style.display = "none";
    return;
  }

  options.style.display = "block";

  const filtered = cities.filter((city) =>
    city.toLowerCase().startsWith(value),
  );
  if (filtered.length == 0) {
    const li = document.createElement("li");
    li.textContent = "No information!";
    options.appendChild(li);
  }

  filtered.forEach((city) => {
    const li = document.createElement("li");
    li.textContent = city;
    li.onclick = () => {
      input.value = city;
      options.style.display = "none";
    };
    options.appendChild(li);
  });
});

btnSearch.addEventListener("click", verifyCity);

function verifyCity() {
  const value = input.value;

  if (!value) {
    alert("Search empty !");
    return;
  }
  input.value = "";
  options.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const langSwitch = document.getElementById("lang_switch");

  const savedLang = localStorage.getItem("lang") || "en";
  loadLanguage(savedLang);
  langSwitch.value = savedLang;

  langSwitch.addEventListener("change", () => {
    loadLanguage(langSwitch.value);
  });
});
