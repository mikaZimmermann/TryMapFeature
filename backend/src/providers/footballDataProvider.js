import { UpstreamHttpClient } from '../services/upstreamHttpClient.js';

const DEFAULT_BASE_URL = 'https://api.football-data.org/v4';

class FootballDataProvider {
  constructor({
    apiKey = process.env.FOOTBALL_DATA_API_KEY,
    baseUrl = process.env.FOOTBALL_DATA_BASE_URL || DEFAULT_BASE_URL
  } = {}) {
    this.name = 'football-data';
    this.baseUrl = baseUrl;

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

  async fetchEvents({ dateFrom, dateTo, competitionCode } = {}) {
    const endpoint = competitionCode
      ? `/competitions/${competitionCode}/matches`
      : '/matches';
    const url = new URL(endpoint, this.baseUrl);

    if (dateFrom) {
      url.searchParams.set('dateFrom', dateFrom);
    }

    if (dateTo) {
      url.searchParams.set('dateTo', dateTo);
    }

    const payload = await this.client.getJson(url);

    return payload.matches ?? [];
  }
}

export default FootballDataProvider;
