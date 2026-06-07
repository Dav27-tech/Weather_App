<?php

require_once __DIR__ . "/_weather_data.php";

$city = weather_normalize_city($_GET["city"] ?? "");
$lang = weather_language($_GET["lang"] ?? "en");

if (!$city) {
    weather_send_json(["error" => "invalid_city"], 400);
}

$apiKey = weather_api_key();
if ($apiKey === "") {
    weather_send_json(weather_local_current($city, $lang));
}

$url = "https://api.openweathermap.org/data/2.5/weather?"
    . http_build_query([
        "q" => $city . ",CD",
        "appid" => $apiKey,
        "units" => "metric",
        "lang" => $lang,
    ]);

$data = weather_http_get_json($url);
if (!$data || (($data["cod"] ?? 200) !== 200 && (string) ($data["cod"] ?? "") !== "200")) {
    weather_send_json(weather_local_current($city, $lang));
}

$weather = $data["weather"][0] ?? [];

weather_send_json([
    "city" => $data["name"] ?? $city,
    "country" => $data["sys"]["country"] ?? "CD",
    "temperature" => round((float) ($data["main"]["temp"] ?? 0)),
    "humidity" => (int) ($data["main"]["humidity"] ?? 0),
    "pressure" => (int) ($data["main"]["pressure"] ?? 0),
    "wind" => round((float) ($data["wind"]["speed"] ?? 0), 1),
    "condition" => $weather["main"] ?? "",
    "description" => $weather["description"] ?? "",
    "icon" => $weather["icon"] ?? "",
    "lat" => (float) ($data["coord"]["lat"] ?? 0),
    "lon" => (float) ($data["coord"]["lon"] ?? 0),
]);
