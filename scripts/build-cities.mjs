// Builds public/cities.json from the GeoNames "cities15000" dump (CC BY 4.0, https://www.geonames.org/).
// Used to name map clicks after the nearest city, since Open-Meteo has no reverse geocoding.
// Run with: npm run build:cities

import { writeFile } from 'node:fs/promises'
import { unzipSync, strFromU8 } from 'fflate'

const DUMP_URL = 'https://download.geonames.org/export/dump'
const OUTPUT = new URL('../public/cities.json', import.meta.url)

// Neighbourhoods and abandoned/historical places make poor "nearest city" labels.
const EXCLUDED_FEATURE_CODES = new Set(['PPLX', 'PPLH', 'PPLQ', 'PPLW'])

async function download(path) {
  const response = await fetch(`${DUMP_URL}/${path}`)
  if (!response.ok) throw new Error(`Failed to download ${path}: ${response.status}`)
  return new Uint8Array(await response.arrayBuffer())
}

function rows(text) {
  return text
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('\t'))
}

const [citiesZip, countryInfo, admin1Codes] = await Promise.all([
  download('cities15000.zip'),
  download('countryInfo.txt'),
  download('admin1CodesASCII.txt'),
])

const countryNames = new Map(rows(strFromU8(countryInfo)).map(columns => [columns[0], columns[4]]))
const regionNames = new Map(rows(strFromU8(admin1Codes)).map(columns => [columns[0], columns[1]]))
const citiesText = strFromU8(unzipSync(citiesZip)['cities15000.txt'])

const countries = []
const regions = []
const countryIndex = new Map()
const regionIndex = new Map()

function indexOf(value, list, index) {
  if (!index.has(value)) {
    index.set(value, list.length)
    list.push(value)
  }
  return index.get(value)
}

const cities = []
for (const columns of rows(citiesText)) {
  const [, name, , , lat, lon, , featureCode, countryCode, , admin1Code] = columns
  if (EXCLUDED_FEATURE_CODES.has(featureCode)) continue

  const country = countryNames.get(countryCode) ?? countryCode
  const region = regionNames.get(`${countryCode}.${admin1Code}`)
  cities.push([
    name,
    Number(Number(lat).toFixed(3)),
    Number(Number(lon).toFixed(3)),
    indexOf(country, countries, countryIndex),
    region ? indexOf(region, regions, regionIndex) : -1,
  ])
}

await writeFile(OUTPUT, JSON.stringify({ countries, regions, cities }))
console.log(`Wrote ${cities.length} cities, ${countries.length} countries, ${regions.length} regions to public/cities.json`)
