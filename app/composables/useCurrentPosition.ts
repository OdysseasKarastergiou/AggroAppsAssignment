function describeError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location access was denied. Allow it in your browser settings to see your local weather.'
    case error.POSITION_UNAVAILABLE:
      return 'Your location is currently unavailable.'
    case error.TIMEOUT:
      return 'Finding your location took too long. Please try again.'
    default:
      return 'Could not determine your location.'
  }
}

export function useCurrentPosition() {
  const locating = ref(false)
  const error = ref<string | null>(null)

  function locate(): Promise<GeolocationCoordinates | null> {
    error.value = null
    if (!('geolocation' in navigator)) {
      error.value = 'Your browser does not support geolocation.'
      return Promise.resolve(null)
    }

    locating.value = true
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          locating.value = false
          resolve(position.coords)
        },
        (positionError) => {
          locating.value = false
          error.value = describeError(positionError)
          resolve(null)
        },
        { timeout: 10_000, maximumAge: 10 * 60 * 1000 },
      )
    })
  }

  return { locate, locating, error }
}
