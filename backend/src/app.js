import cors from 'cors';
import express from 'express';

import FootballDataProvider from './providers/footballDataProvider.js';
import OpenLigaProvider from './providers/openLigaProvider.js';
import { normalizeEvents } from './services/eventNormalizer.js';
import EventStore from './services/eventStore.js';

const app = express();
const syncIntervalMs = Number(process.env.EVENT_SYNC_INTERVAL_MS || 5 * 60 * 1000);

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

const ensureEvents = async ({ force = false, dateFrom, dateTo } = {}) => {
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

  return syncEvents({ dateFrom, dateTo });
};

app.get('/api/v1/events', async (req, res) => {
  try {
    const force = req.query.forceRefresh === 'true';
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;

    const syncStatus = await ensureEvents({ force, dateFrom, dateTo });

    res.json({
      data: eventStore.getEvents(),
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
