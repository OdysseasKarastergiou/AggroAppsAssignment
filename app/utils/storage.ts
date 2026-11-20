export function readSession<T>(key: string, fallback: T): T {
  if (!import.meta.client) return fallback
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  }
  catch {
    return fallback
  }
}

export function writeSession(key: string, value: unknown): void {
  if (!import.meta.client) return
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  }
  catch {
    // Storage can be full or disabled (e.g. private mode); the app keeps working in memory.
  }
}
