# WeatherWise — Full-Stack Weather Assessment

**Candidate:** Rifat Chowdhury  
**Completed:** Tech Assessment #1 (Frontend) and Tech Assessment #2 (Backend)

WeatherWise is a responsive weather application that searches real locations, retrieves live conditions and forecasts, detects the user's location, persists date-range requests, exposes REST APIs, and exports saved data.

## Requirement coverage

| Assessment requirement | Implementation |
|---|---|
| Location input and validation | City, town, postal code, or landmark through Open-Meteo Geocoding |
| Current location | Browser Geolocation API with permission/error handling |
| Current real weather | Open-Meteo Forecast API |
| Five-day forecast | Responsive forecast card grid |
| Graceful errors | Not-found, invalid input/date, denied GPS, upstream API, and server errors |
| Responsive web-first UI | CSS Grid/Flexbox, fluid type, breakpoints at 760px and 430px, overflow-safe table |
| CREATE | Validates a real location and forecast date range, retrieves weather, saves to SQLite |
| READ | List and individual-record REST endpoints |
| UPDATE | Editable, length-limited notes field |
| DELETE | Confirmed deletion of saved records |
| RESTful API | Express JSON endpoints with suitable HTTP methods/status codes |
| Additional integration | OpenStreetMap link centered on selected coordinates |
| Data export | Download all saved records as CSV or JSON |
| Candidate / PM Accelerator info | About page |

## Stack

- React 19 + Vite
- Node.js + Express 5
- Node's built-in SQLite (`node:sqlite`)
- Open-Meteo Geocoding and Forecast APIs (no API key)
- OpenStreetMap

## Run locally

Requirements: **Node.js 22.5+** (Node 24 LTS recommended).

```bash
git clone <YOUR-PUBLIC-GITHUB-URL>
cd weatherwise
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend proxies API requests to `http://localhost:3000`.

Production mode:

```bash
npm run build
npm start
```

Open `http://localhost:3000`.

Tests:

```bash
npm test
```

The SQLite database is created automatically at `data/weather.db` and is excluded from Git.

## REST API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/weather?location=Toronto` | Live conditions and forecast |
| GET | `/api/weather?lat=43.65&lon=-79.38` | Weather by GPS coordinates |
| POST | `/api/records` | Validate, retrieve, and save a date-range request |
| GET | `/api/records` | List saved requests |
| GET | `/api/records/:id` | Read one request including stored weather |
| PATCH | `/api/records/:id` | Update editable notes |
| DELETE | `/api/records/:id` | Delete a request |
| GET | `/api/export.csv` | Export saved requests as CSV |
| GET | `/api/export.json` | Export saved requests as JSON |

Example create body:

```json
{"location":"Toronto","startDate":"2026-08-19","endDate":"2026-08-23","notes":"Weekend trip"}
```

## Design decisions

- Forecast ranges are limited to today through 15 days ahead because this is forecast data, not historical data.
- Weather snapshots are stored as JSON alongside searchable relational fields, combining structured persistence with reproducibility.
- Notes are the safe editable field; changing a saved location or date range creates a new weather request so the stored snapshot remains internally consistent.
- No secret or API key is needed, making review and cloning straightforward.

## Demo checklist (1–2 minutes)

1. Search “Toronto” and show live conditions and the five-day forecast.
2. Search an invalid location to demonstrate graceful error handling.
3. Click **Use my location** and allow browser access.
4. Open the OpenStreetMap link.
5. Save a valid date-range request, then show it in **Saved requests**.
6. Edit its notes, export CSV/JSON, then delete it.
7. Briefly show `server/index.js`, `server/db.js`, and this requirement table.

## Attribution

Weather/geocoding data: [Open-Meteo](https://open-meteo.com/) · Maps: [OpenStreetMap](https://www.openstreetmap.org/)
