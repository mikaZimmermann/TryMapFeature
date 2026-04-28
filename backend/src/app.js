import cors from 'cors';
import express from 'express';

import FootballDataProvider from './providers/footballDataProvider.js';
import OpenLigaProvider from './providers/openLigaProvider.js';
import { normalizeEvents } from './services/eventNormalizer.js';
import EventStore from './services/eventStore.js';

const app = express();
const syncIntervalMs = Number(process.env.EVENT_SYNC_INTERVAL_MS || 5 * 60 * 1000);
const germanyCompetitionCode = process.env.FOOTBALL_GERMANY_COMPETITION_CODE || 'BL1';

const primaryProvider = new FootballDataProvider();
const fallbackProvider = new OpenLigaProvider();
const eventStore = new EventStore();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
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
