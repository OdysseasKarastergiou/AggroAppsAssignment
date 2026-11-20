# Weather Explorer

Junior Frontend Developer assignment for **AgroApps**: a web app for exploring the weather anywhere in the world.

Users can:

- Click anywhere on the world map (Leaflet) to see the weather and some more details at that point.
- Search for a place using a search bar, i implemented showing 5 suggestions.
- A my location button to check the weather at the current location of the user.
- Build up their own picture of the world's weather by saving places. When a user chooses a place on the map and a popup appears
with the place's details, they can add the place to the 'saved places' table for quick use.
- User can clear the table with an 'X' over the specific location or 'clear all' button to clear all locations saved.
- Locations on the saved places table are clickable, user can click on them and the map will move to that location.
- Used geonames API so when user clicks on a map location it doesnt show coordinates but the city, or 'near' to the closest city
based on the geonames database.(explained better below)
- On the footer of the page there are API request counter, that happen when user clicks on a location or searches for one.(for info)
- Cache clear with session, meaning data remains through refresh of page but gets lost when tab closes.

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

**Environment variables:** none. The Open-Meteo APIs are free and need no API key, which is why they were chosen for this project.

No other runtime dependencies. HTTP calls use Nuxt's built-in `$fetch`. The only dev-only extra is `fflate`, used by the script that builds the city list.

### 2. Naming places picked on the map

On each click the nearest city is found locally, and the place is labelled:

- **Within 5 km:** the city itself, e.g. *Thessaloniki · Central Macedonia, Greece*
- **Within 150 km:** *Near Thessaloniki · 8 km away · Macedonia, Greece*
- **Farther away (open sea, remote areas):** the coordinates, with *304 km from Praia, Cabo Verde* as the subtitle

To regenerate the list from the latest GeoNames data, run `npm run build:cities`.

## 3. Next steps

- Forecast for the selected place with animations/charts
- Side-by-side comparison view for saved places
- Unit tests (Vitest) for the composables and component tests for the search combobox