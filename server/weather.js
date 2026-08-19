const GEO = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST = 'https://api.open-meteo.com/v1/forecast';
const OSM = 'https://nominatim.openstreetmap.org/search';

export function validDateRange(startDate, endDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate || '') || !/^\d{4}-\d{2}-\d{2}$/.test(endDate || '')) return false;
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const days = (end - start) / 86400000;
  return !Number.isNaN(days) && days >= 0 && days <= 15;
}

export function looksLikePostalCode(value) {
  const text = String(value ?? '').trim();
  if (!text) return false;
  const compact = text.replace(/\s+/g, '');
  return /^[A-Za-z]\d[A-Za-z]$/i.test(text)
    || /^[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d$/i.test(compact)
    || /^[A-Za-z]{2}\d[A-Za-z\d]?\d[A-Za-z]{2}$/i.test(compact)
    || /^\d{5}$/i.test(text)
    || /^\d{5}-\d{4}$/i.test(text);
}

async function geocodeFallback(location) {
  const query = String(location).trim();
  const url = `${OSM}?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'WeatherWise/1.0 (assessment)', 'Accept-Language': 'en' },
  });
  if (!response.ok) throw Object.assign(new Error('Location service is temporarily unavailable.'), { status: 502 });
  const data = await response.json();
  const match = data?.[0];
  if (!match) throw Object.assign(new Error(`We could not find “${query}”. Check the spelling and try again.`), { status: 404 });

  return {
    name: match.address?.city || match.address?.town || match.address?.village || match.name || query,
    country: match.address?.country || '',
    admin1: match.address?.state || match.address?.province || match.address?.county || '',
    latitude: Number(match.lat),
    longitude: Number(match.lon),
    timezone: 'auto',
  };
}

export async function geocode(location) {
  if (!location || location.trim().length < 2) throw Object.assign(new Error('Enter a valid city, town, postal code, or landmark.'), { status: 400 });
  const trimmed = location.trim();
  const url = `${GEO}?name=${encodeURIComponent(trimmed)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw Object.assign(new Error('Location service is temporarily unavailable.'), { status: 502 });
  const data = await response.json();

  if (data.results?.length) return data.results[0];

  if (looksLikePostalCode(trimmed)) {
    return geocodeFallback(trimmed);
  }

  throw Object.assign(new Error(`We could not find “${location}”. Check the spelling and try again.`), { status: 404 });
}

export async function reverseGeocode(latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw Object.assign(new Error('Invalid GPS coordinates.'), { status: 400 });
  }
  return { name: 'Current location', country: '', admin1: '', latitude, longitude, timezone: 'auto' };
}

export async function getWeather(place, startDate, endDate) {
  const query = new URLSearchParams({
    latitude: place.latitude, longitude: place.longitude,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max',
    timezone: 'auto', forecast_days: '7',
  });
  if (startDate && endDate) { query.set('start_date', startDate); query.set('end_date', endDate); query.delete('forecast_days'); }
  const response = await fetch(`${FORECAST}?${query}`);
  if (!response.ok) throw Object.assign(new Error('Weather service could not complete the request.'), { status: 502 });
  return response.json();
}

export function weatherLabel(code) {
  if (code === 0) return 'Clear sky';
  if ([1, 2, 3].includes(code)) return 'Partly cloudy';
  if ([45, 48].includes(code)) return 'Fog';
  if (code >= 51 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Mixed conditions';
}

export function normalize(place, weather) {
  const daily = weather.daily.time.map((date, i) => ({
    date, code: weather.daily.weather_code[i], condition: weatherLabel(weather.daily.weather_code[i]),
    max: weather.daily.temperature_2m_max[i], min: weather.daily.temperature_2m_min[i],
    precipitationChance: weather.daily.precipitation_probability_max[i],
    sunrise: weather.daily.sunrise[i], sunset: weather.daily.sunset[i], uvIndex: weather.daily.uv_index_max[i],
  }));
  return {
    location: { name: place.name, region: place.admin1 || '', country: place.country || '', latitude: place.latitude, longitude: place.longitude },
    timezone: weather.timezone, units: weather.current_units,
    current: { ...weather.current, condition: weatherLabel(weather.current.weather_code) }, daily,
  };
}
