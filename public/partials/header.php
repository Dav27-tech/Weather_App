<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Feel The Weather</title>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
  />
  <link rel="stylesheet" href="./../assets/css/style.css"/>
</head>
<body>
  <div class="nav-bar">
    <div class="weather">
      <div class="logo">
        <img src="assets/icon/logo_weather.png" alt="weather's logo">
      </div>
      <div class="text">
        <h2>FeelTheWeather</h2>
      </div>
    </div>
    <nav class="header">
      <a href="index.php" class="nav-link <?= ($page === "today") ? 'active':'' ?> ">Today</a>
      <a href="forecast.php" class="nav-link <?= ($page === "forecast") ? 'active':'' ?>">Forecast</a>
      <a href="maps.php" class="nav-link <?= ($page ==="maps") ? 'active' :'' ?>">Maps</a>
      <a href="alerts.php" class="nav-link <?= ($page === "alerts") ? 'active':'' ?>">Alerts</a>
    </nav>
    <div class="search-bar">
      <i id="btnSearch" class="fa-solid fa-magnifying-glass search-icon"></i>
      <input class="input" type="text" name="city" id="city" placeholder="Search a city ..." autocomplete="off">
      <ul id="options"></ul>
    </div>
  </div>

  <script src="assets/js/main.js"></script>
</body>
</html> 