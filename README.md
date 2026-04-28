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

- `NEXT_PUBLIC_MAP_PROVIDER` — `leaflet`, `mapbox`, `google`, etc.
- `NEXT_PUBLIC_MAP_API_KEY` — required for API-key providers (for example Mapbox/Google); optional for Leaflet.
- `NEXT_PUBLIC_MAP_TILE_URL` — optional tile URL override. With `leaflet`, defaults to `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`.


## Leaflet + OpenStreetMap tile guidance

When `NEXT_PUBLIC_MAP_PROVIDER=leaflet`, the frontend uses Leaflet with OSM standard tiles by default.

- **Attribution is required**: keep `© OpenStreetMap contributors` visible in the map UI.
- **Usage limits apply**: the public tile server is community-operated and intended for reasonable, non-abusive usage.
- **Production recommendation**: for high traffic or strict SLA needs, use your own tile infrastructure or a commercial tile provider and override `NEXT_PUBLIC_MAP_TILE_URL`.

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
