const weatherPlaces = {
  三江: { latitude: 25.785, longitude: 109.614 },
  从江: { latitude: 25.747, longitude: 108.905 },
  黎平: { latitude: 26.230, longitude: 109.136 }
};

const weatherLabels = { 0: "晴", 1: "大部晴", 2: "局部多云", 3: "阴", 45: "雾", 48: "雾凇", 51: "小毛雨", 53: "毛毛雨", 55: "毛毛雨", 61: "小雨", 63: "中雨", 65: "大雨", 71: "小雪", 73: "中雪", 75: "大雪", 80: "阵雨", 81: "阵雨", 82: "强阵雨", 95: "雷雨", 96: "雷雨冰雹", 99: "雷雨冰雹" };

function numeric(value, fallback = "暂无") {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

export function weatherLabel(code) {
  return weatherLabels[code] || "天气变化";
}

export async function fetchWeather(city, { signal } = {}) {
  const place = weatherPlaces[city] || weatherPlaces.三江;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=3&timezone=Asia%2FShanghai`;
  const response = await fetch(url, { headers: { Accept: "application/json" }, signal });
  if (!response.ok) throw new Error("weather request failed");
  const current = (await response.json()).current || {};
  const temperature = numeric(current.temperature_2m, "");
  return {
    label: weatherLabel(current.weather_code),
    temperature: temperature === "" ? "" : `${Math.round(temperature)}°C`,
    feelsLike: numeric(current.apparent_temperature) === "暂无" ? "暂无" : `${Math.round(numeric(current.apparent_temperature))}°C`,
    humidity: numeric(current.relative_humidity_2m) === "暂无" ? "暂无" : `${Math.round(numeric(current.relative_humidity_2m))}%`,
    wind: numeric(current.wind_speed_10m) === "暂无" ? "暂无" : `${Math.round(numeric(current.wind_speed_10m))} km/h`
  };
}
