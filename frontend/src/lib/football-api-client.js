const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

function buildUrl(path, params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(key, String(value));
  });

  return `${apiBaseUrl}${path}${query.toString() ? `?${query.toString()}` : ''}`;
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal, cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function getCompetitions({ signal } = {}) {
  const payload = await fetchJson(buildUrl('/api/football/competitions'), signal);
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function getStandings({ competition, season, signal } = {}) {
  const payload = await fetchJson(buildUrl('/api/football/standings', { competition, season }), signal);
  return payload?.data || { standings: [] };
}

export async function getMatches({ competition, season, matchday, dateFrom, dateTo, status, signal } = {}) {
  const payload = await fetchJson(
    buildUrl('/api/football/matches', { competition, season, matchday, dateFrom, dateTo, status }),
    signal
  );
  return Array.isArray(payload?.data) ? payload.data : [];
}
