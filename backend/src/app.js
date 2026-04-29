import cors from 'cors';
import express from 'express';
import crypto from 'crypto';

import FootballDataProvider from './providers/footballDataProvider.js';
import OpenLigaProvider from './providers/openLigaProvider.js';
import { UpstreamHttpError } from './services/upstreamHttpClient.js';
import { normalizeEvents } from './services/eventNormalizer.js';
import EventStore from './services/eventStore.js';

const app = express();
const syncIntervalMs = Number(process.env.EVENT_SYNC_INTERVAL_MS || 5 * 60 * 1000);
const germanyCompetitionCode = process.env.FOOTBALL_GERMANY_COMPETITION_CODE || 'BL1';
const supportedCompetitions = [
  {
    code: 'BL1',
    name: 'Bundesliga',
    emblem: 'https://crests.football-data.org/BL1.png'
  },
  {
    code: 'BL2',
    name: '2. Bundesliga',
    emblem: 'https://crests.football-data.org/BL2.png'
  }
];
const supportedStandingsCompetitions = new Set(['BL1', 'BL2']);
const supportedMatchesCompetitions = new Set(['BL1', 'BL2']);

const primaryProvider = new FootballDataProvider();
const fallbackProvider = new OpenLigaProvider();
const eventStore = new EventStore();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  const headerRequestId = req.get('x-request-id');
  const requestId = headerRequestId || crypto.randomUUID();
  req.requestId = requestId;
  res.set('x-request-id', requestId);
  next();
});

const logUpstreamCall = ({ req, route, competition, query, statusCode, durationMs, errorCode, errorMessage }) => {
  console.info(JSON.stringify({
    event: 'upstream_call',
    requestId: req.requestId,
    route,
    competition,
    query,
    statusCode,
    durationMs,
    ...(errorCode ? { errorCode } : {}),
    ...(errorMessage ? { errorMessage } : {})
  }));
};

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/football/competitions', (_req, res) => {
  res.json({
    data: supportedCompetitions
  });
});

const normalizeStandingsRows = (standingsPayload) => {
  const standingsTables = Array.isArray(standingsPayload?.standings) ? standingsPayload.standings : [];
  const preferredTable = standingsTables.find((entry) => entry.type === 'TOTAL') || standingsTables[0];
  const rows = Array.isArray(preferredTable?.table) ? preferredTable.table : [];

  return rows.map((entry) => ({
    rank: entry.position,
    team: {
      id: entry.team?.id,
      name: entry.team?.name,
      shortName: entry.team?.shortName,
      tla: entry.team?.tla,
      crest: entry.team?.crest
    },
    played: entry.playedGames,
    won: entry.won,
    draw: entry.draw,
    lost: entry.lost,
    goalsFor: entry.goalsFor,
    goalsAgainst: entry.goalsAgainst,
    goalDifference: entry.goalDifference,
    points: entry.points
  }));
};

const buildUpstreamErrorEnvelope = (error) => {
  const status = error instanceof UpstreamHttpError && Number.isInteger(error.status) ? error.status : 502;

  return {
    status,
    body: {
      error: {
        code: error.code || 'UPSTREAM_ERROR',
        message: error.message || 'Upstream request failed',
        service: error.service || 'football-data',
        upstreamStatus: error.status || null
      }
    }
  };
};

const normalizeFootballMatches = (matchesPayload) => {
  const matches = Array.isArray(matchesPayload?.matches) ? matchesPayload.matches : [];

  return matches.map((match) => ({
    id: match.id,
    utcDate: match.utcDate,
    status: match.status,
    homeTeam: {
      name: match.homeTeam?.name,
      crest: match.homeTeam?.crest
    },
    awayTeam: {
      name: match.awayTeam?.name,
      crest: match.awayTeam?.crest
    },
    score: {
      winner: match.score?.winner,
      fullTime: {
        home: match.score?.fullTime?.home,
        away: match.score?.fullTime?.away
      },
      halfTime: {
        home: match.score?.halfTime?.home,
        away: match.score?.halfTime?.away
      }
    }
  }));
};

app.get('/api/football/matches', async (req, res) => {
  const competition = String(req.query.competition || '').toUpperCase();

  if (!supportedMatchesCompetitions.has(competition)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_COMPETITION',
        message: 'competition must be one of: BL1, BL2'
      }
    });
  }

  const sanitizedParams = {
    competitionCode: competition,
    season: req.query.season ? String(req.query.season).trim() : undefined,
    matchday: req.query.matchday ? String(req.query.matchday).trim() : undefined,
    dateFrom: req.query.dateFrom ? String(req.query.dateFrom).trim() : undefined,
    dateTo: req.query.dateTo ? String(req.query.dateTo).trim() : undefined,
    status: req.query.status ? String(req.query.status).trim().toUpperCase() : undefined
  };

  try {
    const payload = await primaryProvider.fetchMatches({
      ...sanitizedParams,
      logger: ({ statusCode, durationMs, errorCode, errorMessage }) => {
        logUpstreamCall({
          req,
          route: '/api/football/matches',
          competition,
          query: sanitizedParams,
          statusCode,
          durationMs,
          errorCode,
          errorMessage
        });
      }
    });

    return res.json({
      data: normalizeFootballMatches(payload)
    });
  } catch (error) {
    const upstreamError = buildUpstreamErrorEnvelope(error);

    return res.status(upstreamError.status).json(upstreamError.body);
  }
});

app.get('/api/football/standings', async (req, res) => {
  const competition = String(req.query.competition || '').toUpperCase();
  const season = req.query.season;

  if (!supportedStandingsCompetitions.has(competition)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_COMPETITION',
        message: 'competition must be one of: BL1, BL2'
      }
    });
  }

  try {
    const params = {
      competitionCode: competition,
      season
    };
    const payload = await primaryProvider.fetchStandings({
      ...params,
      logger: ({ statusCode, durationMs, errorCode, errorMessage }) => {
        logUpstreamCall({
          req,
          route: '/api/football/standings',
          competition,
          query: params,
          statusCode,
          durationMs,
          errorCode,
          errorMessage
        });
      }
    });

    return res.json({
      data: {
        competition: payload?.competition,
        season: payload?.season,
        standings: normalizeStandingsRows(payload)
      }
    });
  } catch (error) {
    const upstreamError = buildUpstreamErrorEnvelope(error);

    return res.status(upstreamError.status).json(upstreamError.body);
  }
});

const markProviderHealthy = (providerName) => {
  eventStore.setProviderHealth(providerName, {
    lastSync: new Date().toISOString(),
    error: null
  });
};

const markProviderError = (providerName, error) => {
  eventStore.setProviderHealth(providerName, {
    lastSync: new Date().toISOString(),
    error: error.message
  });
};

const runProviderIngestion = async (provider, params) => {
  const rawEvents = await provider.fetchEvents(params);
  const normalizedEvents = normalizeEvents(provider.name, rawEvents);
  eventStore.upsertEvents(normalizedEvents);
  markProviderHealthy(provider.name);

  return {
    provider: provider.name,
    count: normalizedEvents.length
  };
};

const syncEvents = async (params = {}) => {
  try {
    return await runProviderIngestion(primaryProvider, params);
  } catch (primaryError) {
    markProviderError(primaryProvider.name, primaryError);

    try {
      const fallbackResult = await runProviderIngestion(fallbackProvider, params);

      return {
        ...fallbackResult,
        fallbackUsed: true,
        fallbackReason: primaryError.message
      };
    } catch (fallbackError) {
      markProviderError(fallbackProvider.name, fallbackError);
      throw new Error(
        `All providers failed. Primary: ${primaryError.message}. Fallback: ${fallbackError.message}`
      );
    }
  }
};

const ensureEvents = async ({ force = false, dateFrom, dateTo, competitionCode } = {}) => {
  const lastIngestedAt = eventStore.getLastIngestedAt();

  if (!force && eventStore.hasEvents() && lastIngestedAt) {
    const age = Date.now() - new Date(lastIngestedAt).getTime();
    if (age < syncIntervalMs) {
      return {
        skipped: true,
        reason: 'cache-fresh'
      };
    }
  }

  return syncEvents({ dateFrom, dateTo, competitionCode });
};

const filterEvents = ({ dateFrom, dateTo, competitionCode } = {}) =>
  eventStore.getEvents().filter((event) => {
    const normalizedCode = String(competitionCode || '').toLowerCase();
    const isCompetitionMatch = competitionCode
      ? String(event.competitionCode || '').toLowerCase() === normalizedCode ||
        String(event.competition || '').toLowerCase().includes(normalizedCode) ||
        String(event.id || '').toLowerCase().includes(`-${normalizedCode}`)
      : true;

    if (!isCompetitionMatch) {
      return false;
    }

    if (!dateFrom && !dateTo) {
      return true;
    }

    const eventDate = new Date(event.startTimeUtc);
    if (Number.isNaN(eventDate.getTime())) {
      return false;
    }

    if (dateFrom) {
      const from = new Date(`${dateFrom}T00:00:00.000Z`);
      if (eventDate < from) {
        return false;
      }
    }

    if (dateTo) {
      const to = new Date(`${dateTo}T23:59:59.999Z`);
      if (eventDate > to) {
        return false;
      }
    }

    return true;
  });

app.get('/api/v1/events', async (req, res) => {
  try {
    const force = req.query.forceRefresh === 'true';
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;
    const competitionCode = req.query.competitionCode;

    const syncStatus = await ensureEvents({ force, dateFrom, dateTo, competitionCode });

    res.json({
      data: filterEvents({ dateFrom, dateTo, competitionCode }),
      sync: syncStatus,
      lastIngestedAt: eventStore.getLastIngestedAt()
    });
  } catch (error) {
    res.status(502).json({
      error: 'Failed to ingest events from all providers',
      details: error.message
    });
  }
});

app.get('/api/v1/events/champions-league/today', async (req, res) => {
  try {
    const force = req.query.forceRefresh !== 'false';
    const todayUtc = new Date().toISOString().slice(0, 10);
    const competitionCode = 'CL';

    const syncStatus = await ensureEvents({
      force,
      dateFrom: todayUtc,
      dateTo: todayUtc,
      competitionCode
    });

    res.json({
      data: filterEvents({ dateFrom: todayUtc, dateTo: todayUtc, competitionCode }),
      sync: syncStatus,
      lastIngestedAt: eventStore.getLastIngestedAt(),
      filters: {
        dateFrom: todayUtc,
        dateTo: todayUtc,
        competitionCode
      }
    });
  } catch (error) {
    res.status(502).json({
      error: 'Failed to ingest Champions League events',
      details: error.message
    });
  }
});

app.get('/api/v1/events/germany/today', async (req, res) => {
  try {
    const force = req.query.forceRefresh !== 'false';
    const todayUtc = new Date().toISOString().slice(0, 10);

    const syncStatus = await ensureEvents({
      force,
      dateFrom: todayUtc,
      dateTo: todayUtc,
      competitionCode: germanyCompetitionCode
    });

    res.json({
      data: filterEvents({
        dateFrom: todayUtc,
        dateTo: todayUtc,
        competitionCode: germanyCompetitionCode
      }),
      sync: syncStatus,
      lastIngestedAt: eventStore.getLastIngestedAt(),
      filters: {
        dateFrom: todayUtc,
        dateTo: todayUtc,
        competitionCode: germanyCompetitionCode
      }
    });
  } catch (error) {
    res.status(502).json({
      error: 'Failed to ingest Germany events',
      details: error.message
    });
  }
});

app.get('/api/v1/providers/health', (_req, res) => {
  res.json({
    providers: eventStore.getProviderHealth(),
    lastIngestedAt: eventStore.getLastIngestedAt()
  });
});

app.get('/api/events', async (_req, res) => {
  res.json(eventStore.getEvents());
});

export default app;
