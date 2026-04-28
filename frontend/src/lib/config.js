import { LEAFLET_PROVIDER, resolveMapProviderConfig } from 'lib/map-provider-adapter';

const provider = (process.env.NEXT_PUBLIC_MAP_PROVIDER || LEAFLET_PROVIDER).toLowerCase();
const requiresApiKey = provider !== LEAFLET_PROVIDER;

if (!process.env.NEXT_PUBLIC_MAP_PROVIDER) {
  console.warn('[config] Missing NEXT_PUBLIC_MAP_PROVIDER. Defaulting to leaflet.');
}

if (requiresApiKey && !process.env.NEXT_PUBLIC_MAP_API_KEY) {
  console.warn('[config] Missing NEXT_PUBLIC_MAP_API_KEY. This provider requires an API key.');
}

export const mapConfig = resolveMapProviderConfig({
  provider,
  apiKey: process.env.NEXT_PUBLIC_MAP_API_KEY || '',
  tileUrl: process.env.NEXT_PUBLIC_MAP_TILE_URL || ''
});
