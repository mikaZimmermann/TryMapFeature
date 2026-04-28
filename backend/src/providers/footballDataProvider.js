const DEFAULT_BASE_URL = 'https://api.football-data.org/v4';

class FootballDataProvider {
  constructor({ apiKey = process.env.FOOTBALL_DATA_API_KEY, baseUrl = DEFAULT_BASE_URL } = {}) {
    this.name = 'football-data';
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async fetchEvents({ dateFrom, dateTo, competitionCode } = {}) {
    if (!this.apiKey) {
      throw new Error('FOOTBALL_DATA_API_KEY is not configured');
    }

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

    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': this.apiKey
      }
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`football-data request failed (${response.status}): ${body.slice(0, 200)}`);
    }

    const payload = await response.json();

    return payload.matches ?? [];
  }
}

export default FootballDataProvider;
