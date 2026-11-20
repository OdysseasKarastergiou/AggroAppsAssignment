# Weather Explorer

Junior Frontend Developer assignment for **AgroApps**: a web app for exploring the weather anywhere in the world.

Users can:

- **Click anywhere on the world map** (Leaflet) to see the weather at that point.
- **Search for a place** using a search bar with up to 5 live suggestions. A place can only be chosen from the suggestions, so there are no "place not found" dead ends. Choosing one flies the map to it and opens its weather.
- **See the weather where they are** with the *My location* button (browser geolocation).
- **Build up their own picture of the world's weather** by saving places. Saved places appear in the *Saved Places* list for quick access and as temperature badges on the map, so you can compare places at a glance, like a TV weather map.

For every place the app shows the current conditions (temperature, feels-like, humidity, wind, precipitation), a 7-day forecast and the local time there.

## 1. Installation and setup

**Prerequisites**

- Node.js **22.18+** (or 24.11+) — some Nuxt build tooling declares this engine range
- npm 10+

**Install and run**

```bash
git clone https://github.com/OdysseasKarastergiou/AggroAppsAssignment.git
cd AggroAppsAssignment
npm install
npm run dev
```

The app runs at <http://localhost:3000>.

**Other scripts**

| Command             | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run build`     | Production build                              |
| `npm run preview`   | Preview the production build locally          |
| `npm run generate`  | Static build (deployable to any static host)  |
| `npm run typecheck` | Type-check the project with `vue-tsc`         |

**Environment variables:** none. The Open-Meteo APIs are free and need no API key.

## 2. Implementation choices

| Area      | Choice |
| --------- | ------ |
| Framework | [Nuxt 4](https://nuxt.com/) (Vue 3, `<script setup>`, TypeScript) |
| Styling   | [Tailwind CSS 4](https://tailwindcss.com/) via `@tailwindcss/vite` |
| Map       | [Leaflet](https://leafletjs.com/) with OpenStreetMap tiles |
| Data      | [Open-Meteo Forecast API](https://open-meteo.com/en/docs) and [Geocoding API](https://open-meteo.com/en/docs/geocoding-api) |

No other runtime dependencies. HTTP calls use Nuxt's built-in `$fetch`.

**Rendering mode:** the app runs as an SPA (`ssr: false`). Everything it does (the map, geolocation, `sessionStorage`) runs in the browser, so server rendering would add complexity without benefit.

**Project structure**

```
app/
├── pages/index.vue              # Page: wires search, map, weather panel and saved places
├── components/
│   ├── SearchBar.vue            # Accessible combobox with debounced suggestions
│   ├── WeatherMap.vue           # Leaflet map, selection pin and saved-place badges
│   ├── WeatherPanel.vue         # Current weather + 7-day forecast + Save button
│   └── SavedPlaces.vue          # "Saved Places" list
├── composables/
│   ├── useForecast.ts           # Cached forecast requests
│   ├── useGeocoding.ts          # Cached place search
│   ├── useSavedPlaces.ts        # Saved places, persisted in sessionStorage
│   ├── useCurrentPosition.ts    # Browser geolocation
│   └── useApiStats.ts           # Request/cache counters shown in the footer
├── utils/                       # Formatting, WMO weather codes, place helpers, storage
└── types/weather.ts             # API and domain types
```

### Being mindful of the Open-Meteo usage limits

Requests are only made in response to a user action: clicking the map, picking a suggestion, opening a saved place or pressing *My location*. Nothing is polled or prefetched. On top of that:

- **Forecast cache (15 minutes):** responses are cached in memory and in `sessionStorage`, so reopening a place or reloading the page within 15 minutes costs no request. Each panel shows when its data was fetched and whether it came from the cache.
- **~1 km grid:** coordinates are rounded to 2 decimals before requesting. Clicks close to each other (and the same city reached through search, a saved place or the map) share one cache entry. This is still finer than the weather model's resolution.
- **One request per place:** current conditions and the 7-day forecast come from a single API call.
- **In-flight deduplication:** if a request for a location is already pending, a second click reuses it instead of firing again.
- **Search:** the search is debounced (300 ms) and needs at least 2 characters. Results are cached per query, and stale requests are cancelled with `AbortController`.
- **Transparency:** the footer shows how many forecast and search requests were made and how many were answered from the cache.

### Saved places

Saved places are stored in `sessionStorage`. They survive page reloads but are cleared when the tab is closed, so each visit starts with a fresh "picture of the world". Each saved place keeps a snapshot of its last known temperature and condition, so the list and map badges can show it **without new requests**. The snapshot is refreshed whenever the place is opened again.

## 3. Incomplete requirements

- **Place names for map clicks:** Open-Meteo has no reverse geocoding, so places picked on the map (or via *My location*) are labelled with their coordinates instead of a town name.

## 4. Next steps

- Reverse geocoding (e.g. Nominatim) to name clicked points
- °C / °F and km/h / mph toggle (can be done client-side without new requests)
- Hourly forecast chart (temperature and precipitation) for the selected place
- Side-by-side comparison view for saved places
- Weather overlay layers on the map (e.g. precipitation or temperature tiles)
- Option to keep saved places across sessions (`localStorage`) and to rename them
- Unit tests (Vitest) for the composables and component tests for the search combobox
- ESLint + Prettier setup and CI

## 5. Additional notes

- The search bar is a keyboard-accessible combobox: ↑/↓ to move, Enter to choose the highlighted suggestion, Esc to close.
- The layout is responsive. On small screens the weather panel and saved places stack below the map.
- Weather data by [Open-Meteo.com](https://open-meteo.com/) (CC BY 4.0). Map data and tiles © OpenStreetMap contributors.
