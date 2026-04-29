const DEFAULT_TIMEOUT_MS = Number(process.env.UPSTREAM_HTTP_TIMEOUT_MS || 10_000);

class UpstreamHttpError extends Error {
  constructor(message, { service, status, code, cause } = {}) {
    super(message, { cause });
    this.name = 'UpstreamHttpError';
    this.service = service;
    this.status = status;
    this.code = code;
  }
}

const mapFetchError = ({ service, timeoutMs, error }) => {
  if (error?.name === 'AbortError') {
    return new UpstreamHttpError(`${service} request timed out after ${timeoutMs}ms`, {
      service,
      code: 'UPSTREAM_TIMEOUT',
      cause: error
    });
  }

  return new UpstreamHttpError(`${service} request failed`, {
    service,
    code: 'UPSTREAM_NETWORK_ERROR',
    cause: error
  });
};

class UpstreamHttpClient {
  constructor({ service, defaultHeaders = {}, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
    this.service = service;
    this.defaultHeaders = defaultHeaders;
    this.timeoutMs = timeoutMs;
  }

  async getJson(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.defaultHeaders,
        signal: controller.signal
      });

      if (!response.ok) {
        const body = await response.text();
        throw new UpstreamHttpError(`${this.service} upstream responded with ${response.status}`, {
          service: this.service,
          status: response.status,
          code: 'UPSTREAM_BAD_STATUS',
          cause: body.slice(0, 200)
        });
      }

      return response.json();
    } catch (error) {
      if (error instanceof UpstreamHttpError) {
        throw error;
      }

      throw mapFetchError({
        service: this.service,
        timeoutMs: this.timeoutMs,
        error
      });
    } finally {
      clearTimeout(timer);
    }
  }
}

export { UpstreamHttpClient, UpstreamHttpError };
