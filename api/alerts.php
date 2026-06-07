<?php

require_once __DIR__ . "/_weather_data.php";

$city = weather_normalize_city($_GET["city"] ?? "");
$lang = weather_language($_GET["lang"] ?? "en");

if (!$city) {
    weather_send_json(["error" => "invalid_city"], 400);
}

weather_send_json([
    "city" => $city,
    "alerts" => [],
    "message" => $lang === "fr" ? "Aucune alerte meteo active" : "No active weather alerts",
]);
