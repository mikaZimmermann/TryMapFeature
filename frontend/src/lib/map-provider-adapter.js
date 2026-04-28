const PROVIDERS = {
  MAPBOX: 'mapbox',
  OSM: 'osm'
};

const DEFAULT_MAPBOX_STYLE = 'mapbox/streets-v12';
const DEFAULT_OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

function buildMapboxTileUrl(apiKey, styleId = DEFAULT_MAPBOX_STYLE) {
  if (!apiKey) {
    return '';
  }

  return `https://api.mapbox.com/styles/v1/${styleId}/tiles/256/{z}/{x}/{y}?access_token=${apiKey}`;
}

export function resolveMapProviderConfig(rawConfig) {
  const provider = (rawConfig.provider || PROVIDERS.MAPBOX).toLowerCase();
  const apiKey = rawConfig.apiKey || '';
  const styleId = rawConfig.styleId || DEFAULT_MAPBOX_STYLE;

  if (provider === PROVIDERS.MAPBOX) {
    return {
      provider,
      apiKey,
      styleId,
      tileUrl: rawConfig.tileUrl || buildMapboxTileUrl(apiKey, styleId),
      tileAttribution:
        '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      requiresApiKey: true
    };
  }

  return {
    provider: PROVIDERS.OSM,
    apiKey,
    styleId,
    tileUrl: rawConfig.tileUrl || DEFAULT_OSM_TILE_URL,
    tileAttribution: '&copy; OpenStreetMap contributors',
    requiresApiKey: false
  };
}

export function getMapProviderStatus(rawConfig) {
  const config = resolveMapProviderConfig(rawConfig);

  return {
    ...config,
    hasRequiredCredentials: config.requiresApiKey ? Boolean(config.apiKey) : true,
    credentialMessage: config.requiresApiKey
      ? config.apiKey
        ? 'Configured'
        : 'Missing (required for this provider)'
      : config.apiKey
        ? 'Configured (optional for this provider)'
        : 'Not required for this provider'
  };
}

export { DEFAULT_MAPBOX_STYLE, DEFAULT_OSM_TILE_URL, PROVIDERS };
