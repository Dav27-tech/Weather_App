<?php

const WEATHER_ALLOWED_CITIES = ["Goma", "Kinshasa", "Bukavu", "Kindu", "Lubumbashi"];

function weather_send_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function weather_normalize_city(?string $city): ?string
{
    $city = trim((string) $city);
    foreach (WEATHER_ALLOWED_CITIES as $allowedCity) {
        if (strtolower($city) === strtolower($allowedCity)) {
            return $allowedCity;
        }
    }
    return null;
}

function weather_language(?string $lang): string
{
    return in_array($lang, ["en", "fr"], true) ? $lang : "en";
}

function weather_api_key(): string
{
    $configPath = dirname(__DIR__) . "/config/config.php";
    if (is_file($configPath)) {
        require_once $configPath;
    }

    if (defined("OPENWEATHER_API_KEY") && OPENWEATHER_API_KEY) {
        return (string) OPENWEATHER_API_KEY;
    }

    $envKey = getenv("OPENWEATHER_API_KEY");
    return $envKey ? (string) $envKey : "";
}

function weather_http_get_json(string $url): ?array
{
    $context = stream_context_create([
        "http" => [
            "timeout" => 8,
            "ignore_errors" => true,
        ],
    ]);

    $raw = @file_get_contents($url, false, $context);
    if ($raw === false) {
        return null;
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : null;
}

function weather_description(string $condition, string $lang): string
{
    $descriptions = [
        "Clear" => ["en" => "clear sky", "fr" => "ciel degage"],
        "Clouds" => ["en" => "scattered clouds", "fr" => "nuages disperses"],
        "Rain" => ["en" => "light rain", "fr" => "pluie legere"],
        "Thunderstorm" => ["en" => "thunderstorm", "fr" => "orage"],
        "Mist" => ["en" => "mist", "fr" => "brume"],
    ];

    return $descriptions[$condition][$lang] ?? $condition;
}

function weather_local_current(string $city, string $lang): array
{
    $data = [
        "Goma" => [
            "country" => "CD",
            "temperature" => 22,
            "humidity" => 76,
            "pressure" => 1014,
            "wind" => 3.4,
            "condition" => "Clouds",
            "lat" => -1.6792,
            "lon" => 29.2228,
        ],
        "Kinshasa" => [
            "country" => "CD",
            "temperature" => 29,
            "humidity" => 70,
            "pressure" => 1010,
            "wind" => 2.7,
            "condition" => "Rain",
            "lat" => -4.4419,
            "lon" => 15.2663,
        ],
        "Bukavu" => [
            "country" => "CD",
            "temperature" => 20,
            "humidity" => 82,
            "pressure" => 1016,
            "wind" => 2.9,
            "condition" => "Clouds",
            "lat" => -2.5083,
            "lon" => 28.8608,
        ],
        "Kindu" => [
            "country" => "CD",
            "temperature" => 27,
            "humidity" => 74,
            "pressure" => 1011,
            "wind" => 2.2,
            "condition" => "Clear",
            "lat" => -2.95,
            "lon" => 25.95,
        ],
        "Lubumbashi" => [
            "country" => "CD",
            "temperature" => 24,
            "humidity" => 48,
            "pressure" => 1015,
            "wind" => 4.1,
            "condition" => "Clear",
            "lat" => -11.6876,
            "lon" => 27.5026,
        ],
    ];

    $current = $data[$city];
    return [
        "city" => $city,
        "country" => $current["country"],
        "temperature" => $current["temperature"],
        "humidity" => $current["humidity"],
        "pressure" => $current["pressure"],
        "wind" => $current["wind"],
        "condition" => $current["condition"],
        "description" => weather_description($current["condition"], $lang),
        "icon" => "",
        "lat" => $current["lat"],
        "lon" => $current["lon"],
        "source" => "local",
    ];
}

function weather_local_forecast(string $city, string $lang): array
{
    $base = weather_local_current($city, $lang);
    $conditions = ["Clouds", "Clear", "Rain", "Clouds", "Clear", "Clouds", "Rain"];
    $daily = [];
    $hourly = [];
    $now = new DateTimeImmutable("now");

    for ($i = 1; $i <= 6; $i++) {
        $condition = $conditions[($i + strlen($city)) % count($conditions)];
        $hourly[] = [
            "time" => $now->modify("+{$i} hours")->format(DateTimeInterface::ATOM),
            "temperature" => $base["temperature"] + (($i % 3) - 1),
            "condition" => $condition,
            "description" => weather_description($condition, $lang),
            "icon" => "",
            "rainProbability" => $condition === "Rain" ? 58 : ($condition === "Clouds" ? 24 : 8),
        ];
    }

    for ($i = 0; $i < 7; $i++) {
        $condition = $conditions[($i + strlen($city)) % count($conditions)];
        $daily[] = [
            "date" => $now->modify("+{$i} days")->format("Y-m-d"),
            "tempMax" => $base["temperature"] + 2 + ($i % 3),
            "tempMin" => $base["temperature"] - 4 + ($i % 2),
            "condition" => $condition,
            "description" => weather_description($condition, $lang),
            "icon" => "",
            "rainProbability" => $condition === "Rain" ? 64 : ($condition === "Clouds" ? 28 : 10),
        ];
    }

    return [
        "hourly" => $hourly,
        "daily" => $daily,
    ];
}
