const TEAM_HOME_LOOKUP = {
  'FC Bayern München': { city: 'Munich', country: 'Germany', lat: 48.2188, lng: 11.6247 },
  'Borussia Dortmund': { city: 'Dortmund', country: 'Germany', lat: 51.4926, lng: 7.4519 },
  'Real Madrid CF': { city: 'Madrid', country: 'Spain', lat: 40.4531, lng: -3.6883 },
  'FC Barcelona': { city: 'Barcelona', country: 'Spain', lat: 41.3809, lng: 2.1228 },
  'Paris Saint-Germain FC': { city: 'Paris', country: 'France', lat: 48.8414, lng: 2.253 },
  'Liverpool FC': { city: 'Liverpool', country: 'England', lat: 53.4308, lng: -2.9608 },
  'Manchester City FC': { city: 'Manchester', country: 'England', lat: 53.4831, lng: -2.2 },
  'Arsenal FC': { city: 'London', country: 'England', lat: 51.5549, lng: -0.1084 },
  'Chelsea FC': { city: 'London', country: 'England', lat: 51.4817, lng: -0.191 },
  'Inter Milano': { city: 'Milan', country: 'Italy', lat: 45.4781, lng: 9.124 },
  'AC Milan': { city: 'Milan', country: 'Italy', lat: 45.4781, lng: 9.124 }
};

const VENUE_LOOKUP = {
  'Allianz Arena': { city: 'Munich', country: 'Germany', lat: 48.2188, lng: 11.6247 },
  'Signal Iduna Park': { city: 'Dortmund', country: 'Germany', lat: 51.4926, lng: 7.4519 },
  'Santiago Bernabéu': { city: 'Madrid', country: 'Spain', lat: 40.4531, lng: -3.6883 },
  'Camp Nou': { city: 'Barcelona', country: 'Spain', lat: 41.3809, lng: 2.1228 },
  'Parc des Princes': { city: 'Paris', country: 'France', lat: 48.8414, lng: 2.253 },
  'Anfield': { city: 'Liverpool', country: 'England', lat: 53.4308, lng: -2.9608 },
  'Etihad Stadium': { city: 'Manchester', country: 'England', lat: 53.4831, lng: -2.2 },
  'Emirates Stadium': { city: 'London', country: 'England', lat: 51.5549, lng: -0.1084 },
  'Stamford Bridge': { city: 'London', country: 'England', lat: 51.4817, lng: -0.191 },
  'San Siro': { city: 'Milan', country: 'Italy', lat: 45.4781, lng: 9.124 }
};

const COUNTRY_CENTROIDS = {
  Germany: { lat: 51.1657, lng: 10.4515 },
  Spain: { lat: 40.4637, lng: -3.7492 },
  France: { lat: 46.2276, lng: 2.2137 },
  England: { lat: 52.3555, lng: -1.1743 },
  Italy: { lat: 41.8719, lng: 12.5674 },
  Europe: { lat: 54.526, lng: 15.2551 }
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const resolveProviderCoordinates = (rawLocationHints = {}) => {
  const lat = toNumber(rawLocationHints.providerLat);
  const lng = toNumber(rawLocationHints.providerLng);

  if (lat === null || lng === null) {
    return null;
  }

  return {
    lat,
    lng,
    city: rawLocationHints.providerCity ?? rawLocationHints.areaName ?? null,
    country: rawLocationHints.providerCountry ?? rawLocationHints.areaName ?? null,
    locationPrecision: 'exact',
    locationSource: 'provider',
    locationConfidence: 1
  };
};

const resolveVenueLookup = (rawLocationHints = {}) => {
  const venueName = rawLocationHints.venueName;
  if (!venueName) {
    return null;
  }

  const byVenue = VENUE_LOOKUP[venueName];
  if (!byVenue) {
    return null;
  }

  return {
    ...byVenue,
    locationPrecision: 'stadium',
    locationSource: 'lookup',
    locationConfidence: 0.9
  };
};

const resolveHomeTeamLookup = (rawLocationHints = {}) => {
  const homeTeam = rawLocationHints.homeTeamName;
  if (!homeTeam) {
    return null;
  }

  const byTeam = TEAM_HOME_LOOKUP[homeTeam];
  if (!byTeam) {
    return null;
  }

  return {
    ...byTeam,
    locationPrecision: 'city',
    locationSource: 'derived',
    locationConfidence: 0.75
  };
};

const resolveCountryFallback = (rawLocationHints = {}) => {
  const country = rawLocationHints.areaName ?? rawLocationHints.providerCountry ?? null;
  if (!country) {
    return null;
  }

  const centroid = COUNTRY_CENTROIDS[country] ?? COUNTRY_CENTROIDS.Europe;
  return {
    lat: centroid?.lat ?? null,
    lng: centroid?.lng ?? null,
    city: rawLocationHints.providerCity ?? null,
    country,
    locationPrecision: rawLocationHints.providerCity ? 'city-centroid' : 'country-centroid',
    locationSource: 'derived',
    locationConfidence: rawLocationHints.providerCity ? 0.55 : 0.45
  };
};

export const enrichEventLocation = (event) => {
  const rawLocationHints = event.rawLocationHints ?? {};

  const resolved =
    resolveProviderCoordinates(rawLocationHints) ??
    resolveVenueLookup(rawLocationHints) ??
    resolveHomeTeamLookup(rawLocationHints) ??
    resolveCountryFallback(rawLocationHints);

  if (!resolved) {
    return {
      ...event,
      lat: null,
      lng: null,
      city: null,
      country: rawLocationHints.areaName ?? null,
      locationPrecision: 'unknown',
      locationSource: 'unknown',
      locationConfidence: 0
    };
  }

  return {
    ...event,
    lat: resolved.lat ?? null,
    lng: resolved.lng ?? null,
    city: resolved.city ?? null,
    country: resolved.country ?? rawLocationHints.areaName ?? null,
    locationPrecision: resolved.locationPrecision,
    locationSource: resolved.locationSource,
    locationConfidence: resolved.locationConfidence
  };
};
