# TryMapFeature

Initial project scaffold for a map-centric UI and optional event API backend.

## Project structure

- `frontend/`: Next.js app shell with routing and a dedicated `map-events` page.
- `backend/`: Optional Express event API (`/api/events`) for map markers and event data.

## Architecture and data flow

1. `frontend/src/app/page.jsx` implements the home route (`/`).
2. `frontend/src/app/map-events/page.jsx` implements the map-focused route (`/map-events`).
3. `frontend/src/components/BaseLayout.jsx` provides shared app chrome and navigation.
4. `frontend/src/lib/config.js` reads map provider settings from environment variables.
5. `frontend/src/app/map-events/page.jsx` is the map feature entry point:
   - Consumes `mapConfig` (provider/key/tile URL).
   - Renders map container placeholder where SDK wiring should happen.
   - Displays event list that should later come from backend data.
6. `backend/src/server.js` exposes `/api/events` for map marker payloads.

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
