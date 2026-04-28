import { PROVIDERS, resolveMapProviderConfig } from 'lib/map-provider-adapter';

const provider = (process.env.NEXT_PUBLIC_MAP_PROVIDER || PROVIDERS.MAPBOX).toLowerCase();
const requiresApiKey = provider === PROVIDERS.MAPBOX;

if (!process.env.NEXT_PUBLIC_MAP_PROVIDER) {
  console.warn('[config] Missing NEXT_PUBLIC_MAP_PROVIDER. Defaulting to mapbox.');
}

if (requiresApiKey && !process.env.NEXT_PUBLIC_MAP_API_KEY) {
  console.warn('[config] Missing NEXT_PUBLIC_MAP_API_KEY. This provider requires an API key.');
}

export const mapConfig = resolveMapProviderConfig({
  provider,
  apiKey: process.env.NEXT_PUBLIC_MAP_API_KEY || '',
  styleId: process.env.NEXT_PUBLIC_MAP_STYLE_ID || '',
  tileUrl: process.env.NEXT_PUBLIC_MAP_TILE_URL || ''
});
