# Football API Integration Contract

## 1) Backend integration module (external API clients/services)

External football API integrations are implemented in the backend providers layer:

- `backend/src/providers/footballDataProvider.js`
  - HTTP client for `https://api.football-data.org/v4`
  - Uses `fetch` with `X-Auth-Token`
  - Supports upstream competition-scoped endpoint: `/competitions/{competitionCode}/matches`
- `backend/src/providers/openLigaProvider.js`
  - HTTP client for `https://api.openligadb.de`
  - Uses `fetch` to `/getmatchdata/{leagueShortcut}/{season}` as fallback provider
- `backend/src/app.js`
  - Wires primary + fallback providers, ingestion, normalization, and public HTTP routes

## 2) Frontend data-fetch layer and league display page/component

Frontend data-fetch behavior and target display components are in:

- `frontend/src/app/map-events/map-events-client.jsx`
  - Client-side data-fetch layer (`fetch(endpoint, { cache: 'no-store' })`)
  - Builds API URLs and query params from search params
  - Renders league/event data on the map and popups
- `frontend/src/app/map-events/page.jsx`
  - Route entry page that renders `MapEventsClient`

League data should appear in `MapEventsClient` on `/map-events`.

## 3) Final backend route prefix decision

**Final route prefix: `/api/football`**

Rationale:
- Domain-specific naming clarifies ownership and future football-only endpoints
- Keeps room for non-football domains later without overloading `/api/v1/events`

## 4) Supported competitions (strict allow-list)

Only these competition codes are supported by contract:

- `BL1`
- `BL2`

Any other `competitionCode` is out of contract and should be rejected by backend validation.

## 5) Frontend/backend contract (endpoint URLs, query params, response shapes)

> This section documents the contract used by frontend. Prefix below is the finalized prefix.

### 5.1 GET `/api/football/events`

Fetches football events by optional filters.

#### Query params

- `dateFrom` (optional, `YYYY-MM-DD`)
- `dateTo` (optional, `YYYY-MM-DD`)
- `competitionCode` (optional, enum: `BL1 | BL2`)
- `forceRefresh` (optional, `true | false`, default backend behavior)

#### Response shape

```json
{
  "data": [
    {
      "id": "string",
      "provider": "football-data | open-liga",
      "competition": "string",
      "competitionCode": "BL1 | BL2",
      "homeTeam": "string",
      "awayTeam": "string",
      "startTimeUtc": "ISO-8601 datetime",
      "venue": "string|null",
      "lat": 0,
      "lng": 0,
      "locationPrecision": "exact | approximate"
    }
  ],
  "sync": {
    "provider": "string",
    "count": 0,
    "fallbackUsed": true,
    "fallbackReason": "string"
  },
  "lastIngestedAt": "ISO-8601 datetime"
}
```

Notes:
- `sync.fallbackUsed` and `sync.fallbackReason` may be omitted when fallback is not used.
- `sync` may return `{ "skipped": true, "reason": "cache-fresh" }` if cache is still fresh.

### 5.2 GET `/api/football/events/germany/today`

Fetches today’s Germany league events for allow-listed competitions.

#### Query params

- `forceRefresh` (optional, `true | false`)
- `competitionCode` (optional override, enum: `BL1 | BL2`)

#### Response shape

```json
{
  "data": [
    {
      "id": "string",
      "competitionCode": "BL1 | BL2",
      "homeTeam": "string",
      "awayTeam": "string",
      "startTimeUtc": "ISO-8601 datetime",
      "lat": 0,
      "lng": 0
    }
  ],
  "sync": {
    "provider": "string",
    "count": 0
  },
  "lastIngestedAt": "ISO-8601 datetime",
  "filters": {
    "dateFrom": "YYYY-MM-DD",
    "dateTo": "YYYY-MM-DD",
    "competitionCode": "BL1 | BL2"
  }
}
```

### 5.3 Error shape (all endpoints)

```json
{
  "error": "string",
  "details": "string"
}
```
