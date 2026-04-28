const DEFAULT_BASE_URL = 'https://api.openligadb.de';

class OpenLigaProvider {
  constructor({ baseUrl = DEFAULT_BASE_URL, leagueShortcut = 'bl1' } = {}) {
    this.name = 'open-liga';
    this.baseUrl = baseUrl;
    this.leagueShortcut = leagueShortcut;
  }

  async fetchEvents() {
    const season = this.getCurrentSeason();
    const url = new URL(`/getmatchdata/${this.leagueShortcut}/${season}`, this.baseUrl);
    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`open-liga request failed (${response.status}): ${body.slice(0, 200)}`);
    }

    return response.json();
  }

  getCurrentSeason() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;

    return month >= 7 ? year : year - 1;
  }
}

export default OpenLigaProvider;
