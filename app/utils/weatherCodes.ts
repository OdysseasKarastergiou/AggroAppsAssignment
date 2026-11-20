export interface WeatherDescription {
  label: string
  icon: string
}

interface WeatherCodeInfo {
  label: string
  day: string
  night?: string
}

/** WMO weather interpretation codes, as returned by Open-Meteo. */
const WEATHER_CODES: Record<number, WeatherCodeInfo> = {
  0: { label: 'Clear sky', day: '☀️', night: '🌙' },
  1: { label: 'Mainly clear', day: '🌤️', night: '🌙' },
  2: { label: 'Partly cloudy', day: '⛅', night: '☁️' },
  3: { label: 'Overcast', day: '☁️' },
  45: { label: 'Fog', day: '🌫️' },
  48: { label: 'Rime fog', day: '🌫️' },
  51: { label: 'Light drizzle', day: '🌦️', night: '🌧️' },
  53: { label: 'Drizzle', day: '🌦️', night: '🌧️' },
  55: { label: 'Dense drizzle', day: '🌧️' },
  56: { label: 'Freezing drizzle', day: '🌧️' },
  57: { label: 'Dense freezing drizzle', day: '🌧️' },
  61: { label: 'Light rain', day: '🌦️', night: '🌧️' },
  63: { label: 'Rain', day: '🌧️' },
  65: { label: 'Heavy rain', day: '🌧️' },
  66: { label: 'Freezing rain', day: '🌧️' },
  67: { label: 'Heavy freezing rain', day: '🌧️' },
  71: { label: 'Light snow', day: '🌨️' },
  73: { label: 'Snow', day: '🌨️' },
  75: { label: 'Heavy snow', day: '❄️' },
  77: { label: 'Snow grains', day: '❄️' },
  80: { label: 'Light showers', day: '🌦️', night: '🌧️' },
  81: { label: 'Showers', day: '🌧️' },
  82: { label: 'Violent showers', day: '⛈️' },
  85: { label: 'Snow showers', day: '🌨️' },
  86: { label: 'Heavy snow showers', day: '❄️' },
  95: { label: 'Thunderstorm', day: '⛈️' },
  96: { label: 'Thunderstorm with hail', day: '⛈️' },
  99: { label: 'Thunderstorm with heavy hail', day: '⛈️' },
}

export function describeWeather(code: number, isDay = true): WeatherDescription {
  const info = WEATHER_CODES[code]
  if (!info) return { label: 'Unknown', icon: '❔' }
  return { label: info.label, icon: isDay ? info.day : (info.night ?? info.day) }
}
