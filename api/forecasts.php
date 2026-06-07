<?php

require_once __DIR__ . "/_weather_data.php";

$city = weather_normalize_city($_GET["city"] ?? "");
$lang = weather_language($_GET["lang"] ?? "en");

if (!$city) {
    weather_send_json(["error" => "invalid_city"], 400);
}

$apiKey = weather_api_key();
if ($apiKey === "") {
    weather_send_json(weather_local_forecast($city, $lang));
}

$url = "https://api.openweathermap.org/data/2.5/forecast?"
    . http_build_query([
        "q" => $city . ",CD",
        "appid" => $apiKey,
        "units" => "metric",
        "lang" => $lang,
    ]);

$data = weather_http_get_json($url);
if (!$data || (($data["cod"] ?? "200") !== "200" && ($data["cod"] ?? 200) !== 200)) {
    weather_send_json(weather_local_forecast($city, $lang));
}

$items = $data["list"] ?? [];
$hourly = [];
$dailyGroups = [];

foreach (array_slice($items, 0, 6) as $item) {
    $weather = $item["weather"][0] ?? [];
    $hourly[] = [
        "time" => $item["dt_txt"] ?? "",
        "temperature" => round((float) ($item["main"]["temp"] ?? 0)),
        "condition" => $weather["main"] ?? "",
        "description" => $weather["description"] ?? "",
        "icon" => $weather["icon"] ?? "",
        "rainProbability" => round(((float) ($item["pop"] ?? 0)) * 100),
    ];
}

foreach ($items as $item) {
    $date = substr((string) ($item["dt_txt"] ?? ""), 0, 10);
    if (!$date) {
        continue;
    }

    $weather = $item["weather"][0] ?? [];
    if (!isset($dailyGroups[$date])) {
        $dailyGroups[$date] = [
            "date" => $date,
            "tempMax" => -100,
            "tempMin" => 100,
            "condition" => $weather["main"] ?? "",
            "description" => $weather["description"] ?? "",
            "icon" => $weather["icon"] ?? "",
            "rainProbability" => 0,
        ];
    }

    $dailyGroups[$date]["tempMax"] = max($dailyGroups[$date]["tempMax"], round((float) ($item["main"]["temp_max"] ?? 0)));
    $dailyGroups[$date]["tempMin"] = min($dailyGroups[$date]["tempMin"], round((float) ($item["main"]["temp_min"] ?? 0)));
    $dailyGroups[$date]["rainProbability"] = max($dailyGroups[$date]["rainProbability"], round(((float) ($item["pop"] ?? 0)) * 100));
}

$daily = array_slice(array_values($dailyGroups), 0, 7);

weather_send_json([
    "hourly" => $hourly,
    "daily" => $daily,
]);
