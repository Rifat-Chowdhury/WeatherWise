# WeatherWise

**A full-stack weather planning application built with React, Express, and SQLite.**

WeatherWise brings current weather, five-day forecasts, and saved date-range planning into one responsive application. Search for a location or use your GPS coordinates, review weather conditions, and save forecast requests with notes. Saved requests persist in SQLite and can be viewed, updated, deleted, or exported as CSV and JSON.

The project connects external weather services to a complete application workflow: location lookup, forecast retrieval, data transformation, persistent storage, and a user-facing interface.

## Features

- **Location search:** Look up cities, towns, postal codes, and landmarks supported by the geocoding services.
- **Current weather and five-day forecasts:** View temperature, feels-like temperature, humidity, wind, precipitation, and daily forecast details.
- **GPS support:** Retrieve weather for your current coordinates through browser geolocation, with permission and error handling.
- **Saved forecast plans:** Store a location, date range, and notes, along with temperature, humidity, and wind summaries for the selected range.
- **Persistent CRUD operations:** View saved requests, edit dates and notes, and delete records. Updates retrieve fresh weather and replace the stored snapshot.
- **CSV and JSON exports:** Download saved request metadata and weather summaries for further use.
- **Responsive interface:** Browse forecast cards and saved requests across desktop and mobile layouts, and open the selected coordinates in OpenStreetMap.

## Engineering highlights

- **API integration and normalization:** The Express backend resolves locations and transforms Open-Meteo responses into consistent current, daily, and date-range summary data for the frontend.
- **Relational storage with weather snapshots:** SQLite stores request metadata alongside JSON weather snapshots, retaining the forecast data associated with each saved request.
- **Server-side validation:** Saved requests are limited to the supported forecast window, notes are bounded, and the API returns errors for invalid input, missing records, and upstream failures.
- **Consistent updates:** Editing a saved request refreshes its forecast snapshot and summaries rather than retaining weather from an earlier date selection.
- **Straightforward local setup:** No API key is required, and one development command starts both the frontend and backend.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite |
| Backend | Node.js, Express 5 |
| Persistence | Node's built-in SQLite (`node:sqlite`) |
| Weather and location lookup | Open-Meteo Forecast and Geocoding APIs |
| Postal-code fallback and maps | OpenStreetMap Nominatim, OpenStreetMap links |

## Run locally

Requires **Node.js 22.5 or newer** with `node:sqlite` support.

```bash
git clone https://github.com/Rifat-Chowdhury/WeatherWise.git
cd WeatherWise
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The frontend proxies API requests to the backend at `http://localhost:3000`.

### Production build

```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000). Express serves the built frontend and API.

### Tests

```bash
npm test
```

The SQLite database is created automatically at `data/weather.db` and is excluded from Git.

## Design decisions

- **Forecast planning, not historical lookup:** Saved date ranges must fall between today and 15 days ahead, with a maximum inclusive range of 16 days.
- **Stored snapshots:** Relational fields capture location, coordinates, dates, notes, and timestamps; JSON preserves the normalized weather response for each request.
- **Useful range summaries:** Temperature, humidity, and wind are summarized across the selected forecast days, allowing saved requests to represent both single-day and multi-day plans.
- **Refresh on update:** Updating dates or notes retrieves fresh weather for the saved coordinates and selected range before replacing the snapshot.
- **Location-service boundaries:** Open-Meteo handles primary location lookup. Postal-code searches that return no match use Nominatim as a fallback; landmark availability depends on the primary geocoder.
- **No API-key configuration:** The integrated public services let reviewers run the project without setting up credentials.

## REST API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Check server health |
| GET | `/api/weather?location=Toronto` | Retrieve current weather and forecast |
| GET | `/api/weather?lat=43.65&lon=-79.38` | Retrieve weather by coordinates |
| POST | `/api/records` | Validate a date range, retrieve weather, and save a request |
| GET | `/api/records` | List saved requests and weather summaries |
| GET | `/api/records/:id` | Retrieve one request with its stored weather snapshot |
| PATCH | `/api/records/:id` | Update dates or notes and refresh stored weather |
| DELETE | `/api/records/:id` | Delete a saved request |
| GET | `/api/export.csv` | Export request metadata and summary fields as CSV |
| GET | `/api/export.json` | Export saved request metadata and summaries as JSON |

### Create a saved request

Example body structure; replace both date values with `YYYY-MM-DD` dates within the current forecast window before sending:

```json
{
  "location": "Toronto",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "notes": "Weekend trip"
}
```

The end date must be on or after the start date. Notes are limited to 300 characters.

## Demo walkthrough

1. Search for **Toronto** and review the current conditions and five-day forecast.
2. Try an unknown location to see error handling, then use **Use my location** and open the map link.
3. Save a location, valid forecast date range, and notes; review its summaries in **Saved requests**.
4. Edit the dates or notes, export the records as CSV or JSON, and delete the saved request.

## Attribution

Weather and primary geocoding data: [Open-Meteo](https://open-meteo.com/). Postal-code fallback and map links: [OpenStreetMap](https://www.openstreetmap.org/).
