const DEFAULT_BASE_URL = 'https://api.football-data.org/v4';

class FootballDataProvider {
  constructor({ apiKey = process.env.FOOTBALL_DATA_API_KEY, baseUrl = DEFAULT_BASE_URL } = {}) {
    this.name = 'football-data';
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async fetchEvents({ dateFrom, dateTo, competitionCode, competitionId } = {}) {
    if (!this.apiKey) {
      throw new Error('FOOTBALL_DATA_API_KEY is not configured');
    }

    const endpoint = competitionId
      ? `/competitions/${competitionId}/matches`
      : competitionCode
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
    const matches = payload.matches ?? [];

    if (!competitionId) {
      return matches;
    }

    const teamsUrl = new URL(`/competitions/${competitionId}/teams`, this.baseUrl);
    const teamsResponse = await fetch(teamsUrl, {
      headers: {
        'X-Auth-Token': this.apiKey
      }
    });

    if (!teamsResponse.ok) {
      return matches;
    }

    const teamsPayload = await teamsResponse.json();
    const teams = teamsPayload.teams ?? [];
    const teamVenueById = new Map(teams.map((team) => [team.id, {
      venue: team.venue ?? null,
      address: team.address ?? null,
      clubColors: team.clubColors ?? null
    }]));

    return matches.map((match) => ({
      ...match,
      inferredVenue: teamVenueById.get(match.homeTeam?.id) ?? null
    }));
  }
}

export default FootballDataProvider;
