const COMPASS_POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

export function formatCoordinates(latitude: number, longitude: number): string {
  const ns = latitude >= 0 ? 'N' : 'S'
  const ew = longitude >= 0 ? 'E' : 'W'
  return `${Math.abs(latitude).toFixed(2)}°${ns}, ${Math.abs(longitude).toFixed(2)}°${ew}`
}

export function formatTemperature(celsius: number): string {
  return `${Math.round(celsius)}°`
}

export function compassDirection(degrees: number): string {
  return COMPASS_POINTS[Math.round(degrees / 45) % COMPASS_POINTS.length] ?? 'N'
}

/** Open-Meteo returns local times without an offset, e.g. "2026-11-20T11:30". */
export function formatLocalTime(isoDateTime: string): string {
  return isoDateTime.slice(11, 16)
}

export function formatClockTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function formatWeekday(isoDate: string, index: number): string {
  if (index === 0) return 'Today'
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short' })
}

export function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#39;')
}
