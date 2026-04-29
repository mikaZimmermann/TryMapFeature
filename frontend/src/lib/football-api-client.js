const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

const isLocalEnvironment = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
};

export const getApiBaseUrlConfigWarning = () => {
  if (apiBaseUrl) return '';
  return isLocalEnvironment()
    ? ''
    : 'NEXT_PUBLIC_API_BASE_URL is not set. Set it to your deployed backend origin (for example: https://<backend-domain>) so API requests can reach /api/football/* routes.';
};

export class BackendApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = 'BackendApiError';
    this.status = status;
    this.code = code;
    this.details = details || null;
  }
}

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
  const responseText = await response.text();
  let body = null;

  try {
    body = responseText ? JSON.parse(responseText) : null;
  } catch {
    body = null;
  }

  const requestLog = {
    request: {
      method: 'GET',
      url
    },
    response: {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body
    }
  };

  if (!response.ok) {
    const errorMessage = body?.error?.message || 'Request failed';
    throw new BackendApiError(`${errorMessage} (status ${response.status})`, {
      status: response.status,
      code: body?.error?.code,
      details: requestLog
    });
  }

  return {
    payload: body,
    requestLog
  };
}

export async function getCompetitions({ signal } = {}) {
  const { payload, requestLog } = await fetchJson(buildUrl('/api/football/competitions'), signal);
  return {
    data: Array.isArray(payload?.data) ? payload.data : [],
    requestLog
  };
}

export async function getStandings({ competition, season, signal } = {}) {
  const { payload, requestLog } = await fetchJson(buildUrl('/api/football/standings', { competition, season }), signal);
  return {
    data: payload?.data || { standings: [] },
    upstreamLog: payload?.log || null,
    requestLog
  };
}

export async function getMatches({ competition, season, matchday, dateFrom, dateTo, status, signal } = {}) {
  const { payload, requestLog } = await fetchJson(
    buildUrl('/api/football/matches', { competition, season, matchday, dateFrom, dateTo, status }),
    signal
  );
  return {
    data: Array.isArray(payload?.data) ? payload.data : [],
    upstreamLog: payload?.log || null,
    requestLog
  };
}
