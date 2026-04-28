const requiredVars = ['NEXT_PUBLIC_MAP_PROVIDER', 'NEXT_PUBLIC_MAP_API_KEY'];

requiredVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.warn(`[config] Missing ${varName}. Map integrations may not render correctly.`);
  }
});

export const mapConfig = {
  provider: process.env.NEXT_PUBLIC_MAP_PROVIDER || 'mapbox',
  apiKey: process.env.NEXT_PUBLIC_MAP_API_KEY || '',
  tileUrl:
    process.env.NEXT_PUBLIC_MAP_TILE_URL ||
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
};
