# TryMapFeature

Initial project scaffold for a map-centric UI and optional event API backend.

## Project structure

- `frontend/`: Next.js app shell with routing and a dedicated `map-events` page.
- `backend/`: Optional Express event API (`/api/events`) for map markers and event data, with local and Vercel entrypoints.

## Architecture and data flow

1. `frontend/src/app/page.jsx` implements the home route (`/`).
2. `frontend/src/app/map-events/page.jsx` implements the map-focused route (`/map-events`).
3. `frontend/src/components/BaseLayout.jsx` provides shared app chrome and navigation.
4. `frontend/src/lib/config.js` reads map provider settings from environment variables.
5. `frontend/src/app/map-events/page.jsx` is the map feature entry point:
   - Consumes `mapConfig` (provider/key/tile URL).
   - Renders map container placeholder where SDK wiring should happen.
   - Displays event list that should later come from backend data.
6. `backend/src/app.js` builds and exports the Express app used by both local and serverless runtimes.
7. `backend/src/server.js` is the local runner that listens on `PORT` (default `4000`).
8. `backend/api/index.js` is the Vercel serverless entrypoint that exports the app handler.

## Environment setup

Use either `.env.example` at repo root or `frontend/.env.example` as your template.

```bash
cp frontend/.env.example frontend/.env.local
```

Variables:

- `NEXT_PUBLIC_MAP_PROVIDER` — `mapbox` (default) or `osm`.
- `NEXT_PUBLIC_MAP_API_KEY` — required for `mapbox`; optional for `osm`.
- `NEXT_PUBLIC_MAP_STYLE_ID` — optional mapbox style (defaults to `mapbox/streets-v12`).
- `NEXT_PUBLIC_MAP_TILE_URL` — optional tile URL override for custom/self-hosted tiles.

### Backend (API)

- `FOOTBALL_DATA_API_KEY` — required to use the football-data.org primary provider.
- `EVENT_SYNC_INTERVAL_MS` — optional cache/sync window in milliseconds (defaults to `300000`).
- `FOOTBALL_GERMANY_COMPETITION_CODE` — optional football-data competition code for Germany endpoint (defaults to `BL1`).

When deploying on Vercel, set both values in your project environment variables (`Settings -> Environment Variables`).


## Tile provider guidance

The v1 frontend is now committed to **Mapbox** as the primary tile provider.

- **Attribution is required**: Mapbox and OpenStreetMap attribution must remain visible.
- **Usage and billing limits apply**: monitor tile usage against your Mapbox plan.
- **Fallback option**: set `NEXT_PUBLIC_MAP_PROVIDER=osm` only for low-traffic/testing scenarios if you need a no-key provider.

## Run locally

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Default URL: `http://localhost:3000`

### Backend (optional)

```bash
cd backend
npm install
npm run dev
```

Default URL: `http://localhost:4000`

## Next implementation points

- Replace the placeholder in `map-events/page.jsx` with actual map SDK initialization.
- Fetch backend events from `GET /api/events` and render map markers.
- Add request state handling (loading/error/empty) and filtering/clustering.

### Deploy backend on Vercel

The backend includes `backend/vercel.json` that routes all requests to the Node serverless function in `backend/api/index.js`, which reuses the shared Express app from `backend/src/app.js`.

After deployment, these endpoints are still available:

- `/health`
- `/api/v1/events`
- `/api/v1/events/germany/today`
- `/api/v1/providers/health`
