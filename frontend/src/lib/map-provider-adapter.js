const LEAFLET_PROVIDER = 'leaflet';
const DEFAULT_OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export function resolveMapProviderConfig(rawConfig) {
  const provider = (rawConfig.provider || LEAFLET_PROVIDER).toLowerCase();
  const isLeaflet = provider === LEAFLET_PROVIDER;

  const resolvedConfig = {
    provider,
    isLeaflet,
    apiKey: rawConfig.apiKey || '',
    tileUrl: isLeaflet ? rawConfig.tileUrl || DEFAULT_OSM_TILE_URL : rawConfig.tileUrl || '',
    requiresApiKey: !isLeaflet
  };

  return resolvedConfig;
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
        ? 'Configured (optional for Leaflet)'
        : 'Not required for Leaflet'
  };
}

export { DEFAULT_OSM_TILE_URL, LEAFLET_PROVIDER };
