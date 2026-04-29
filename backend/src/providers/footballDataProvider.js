import { UpstreamHttpClient } from '../services/upstreamHttpClient.js';

const DEFAULT_BASE_URL = 'https://api.football-data.org/v4';
const API_VERSION_SEGMENT = '/v4';

const normalizeFootballDataBaseUrl = (baseUrl = DEFAULT_BASE_URL) => {
  const trimmedBaseUrl = String(baseUrl).trim().replace(/\/+$/, '');

  if (trimmedBaseUrl.endsWith(API_VERSION_SEGMENT)) {
    return trimmedBaseUrl;
  }

  return `${trimmedBaseUrl}${API_VERSION_SEGMENT}`;
};

const buildFootballDataUrl = (endpointPath, baseUrl = process.env.FOOTBALL_DATA_BASE_URL || DEFAULT_BASE_URL) => {
  const normalizedBaseUrl = normalizeFootballDataBaseUrl(baseUrl);
  const normalizedPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;

  // Expected final shape: https://api.football-data.org/v4/...
  return new URL(normalizedPath, normalizedBaseUrl);
};

class FootballDataProvider {
  constructor({
    apiKey = process.env.FOOTBALL_DATA_API_KEY,
    baseUrl = process.env.FOOTBALL_DATA_BASE_URL || DEFAULT_BASE_URL
  } = {}) {
    this.name = 'football-data';
    this.baseUrl = normalizeFootballDataBaseUrl(baseUrl);

    if (!apiKey) {
      throw new Error('FOOTBALL_DATA_API_KEY is not configured');
    }

    this.client = new UpstreamHttpClient({
      service: this.name,
      defaultHeaders: {
        'X-Auth-Token': apiKey
      }
    });
  }

  async fetchEvents({ dateFrom, dateTo, competitionCode, logger } = {}) {
    const endpoint = competitionCode
      ? `/competitions/${competitionCode}/matches`
      : '/matches';
    const url = buildFootballDataUrl(endpoint, this.baseUrl);

    if (dateFrom) {
      url.searchParams.set('dateFrom', dateFrom);
    }

    if (dateTo) {
      url.searchParams.set('dateTo', dateTo);
    }

    const payload = await this.client.getJson(url, { logger });

    return payload.matches ?? [];
  }

  async fetchStandings({ competitionCode, season, logger } = {}) {
    const url = buildFootballDataUrl(`/competitions/${competitionCode}/standings`, this.baseUrl);

    if (season) {
      url.searchParams.set('season', season);
    }

    return this.client.getJson(url, { logger });
  }

  async fetchMatches({ competitionCode, season, matchday, dateFrom, dateTo, status, logger } = {}) {
    const url = buildFootballDataUrl(`/competitions/${competitionCode}/matches`, this.baseUrl);

    if (season) {
      url.searchParams.set('season', season);
    }

    if (matchday) {
      url.searchParams.set('matchday', matchday);
    }

    if (dateFrom) {
      url.searchParams.set('dateFrom', dateFrom);
    }

    if (dateTo) {
      url.searchParams.set('dateTo', dateTo);
    }

    if (status) {
      url.searchParams.set('status', status);
    }

    return this.client.getJson(url, { logger });
  }
}

export default FootballDataProvider;
