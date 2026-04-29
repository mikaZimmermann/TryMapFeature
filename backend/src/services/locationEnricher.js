const CLUB_LOCATIONS = [
  { city: 'Munich', country: 'Germany', lat: 48.2188, lng: 11.6247, aliases: ['FC Bayern München', 'Bayern Munich'], venues: ['Allianz Arena'] },
  { city: 'Leverkusen', country: 'Germany', lat: 51.0382, lng: 6.9861, aliases: ['Bayer 04 Leverkusen', 'Bayer Leverkusen'], venues: ['BayArena'] },
  { city: 'Frankfurt', country: 'Germany', lat: 50.0686, lng: 8.6455, aliases: ['Eintracht Frankfurt'], venues: ['Deutsche Bank Park', 'Waldstadion'] },
  { city: 'Dortmund', country: 'Germany', lat: 51.4926, lng: 7.4519, aliases: ['Borussia Dortmund'], venues: ['Signal Iduna Park'] },
  { city: 'Leipzig', country: 'Germany', lat: 51.3458, lng: 12.3486, aliases: ['RB Leipzig', 'RasenBallsport Leipzig'], venues: ['Red Bull Arena'] },
  { city: 'Freiburg im Breisgau', country: 'Germany', lat: 47.999, lng: 7.8421, aliases: ['SC Freiburg'], venues: ['Europa-Park Stadion'] },
  { city: 'Mainz', country: 'Germany', lat: 49.9842, lng: 8.2243, aliases: ['1. FSV Mainz 05', 'FSV Mainz 05'], venues: ['MEWA Arena', 'Opel Arena'] },
  { city: 'Mönchengladbach', country: 'Germany', lat: 51.1746, lng: 6.3852, aliases: ['Borussia Mönchengladbach'], venues: ['BORUSSIA-PARK'] },
  { city: 'Stuttgart', country: 'Germany', lat: 48.7923, lng: 9.232, aliases: ['VfB Stuttgart'], venues: ['MHPArena', 'Mercedes-Benz Arena'] },
  { city: 'Bremen', country: 'Germany', lat: 53.0664, lng: 8.8378, aliases: ['SV Werder Bremen', 'Werder Bremen'], venues: ['wohninvest WESERSTADION', 'Weserstadion'] },
  { city: 'Augsburg', country: 'Germany', lat: 48.3223, lng: 10.8857, aliases: ['FC Augsburg'], venues: ['WWK Arena'] },
  { city: 'Berlin', country: 'Germany', lat: 52.4572, lng: 13.5683, aliases: ['1. FC Union Berlin', 'Union Berlin'], venues: ['An der Alten Försterei'] },
  { city: 'Sinsheim', country: 'Germany', lat: 49.2389, lng: 8.8942, aliases: ['TSG 1899 Hoffenheim', 'TSG Hoffenheim'], venues: ['PreZero Arena', 'Rhein-Neckar-Arena'] },
  { city: 'Wolfsburg', country: 'Germany', lat: 52.4319, lng: 10.8039, aliases: ['VfL Wolfsburg'], venues: ['Volkswagen Arena'] },
  { city: 'Cologne', country: 'Germany', lat: 50.9335, lng: 6.8755, aliases: ['1. FC Köln', 'FC Köln', '1. FC Cologne'], venues: ['RheinEnergieSTADION'] },
  { city: 'Hamburg', country: 'Germany', lat: 53.5872, lng: 9.8987, aliases: ['Hamburger SV'], venues: ['Volksparkstadion'] },
  { city: 'Heidenheim an der Brenz', country: 'Germany', lat: 48.6808, lng: 10.1529, aliases: ['1. FC Heidenheim 1846', 'FC Heidenheim'], venues: ['Voith-Arena'] },
  { city: 'Bochum', country: 'Germany', lat: 51.4903, lng: 7.2368, aliases: ['VfL Bochum 1848', 'VfL Bochum'], venues: ['Vonovia Ruhrstadion'] },

  { city: 'Düsseldorf', country: 'Germany', lat: 51.2617, lng: 6.7338, aliases: ['Fortuna Düsseldorf'], venues: ['Merkur Spiel-Arena'] },
  { city: 'Karlsruhe', country: 'Germany', lat: 49.2393, lng: 8.3538, aliases: ['Karlsruher SC'], venues: ['BBBank Wildpark'] },
  { city: 'Paderborn', country: 'Germany', lat: 51.7259, lng: 8.7579, aliases: ['SC Paderborn 07'], venues: ['Home Deluxe Arena'] },
  { city: 'Kaiserslautern', country: 'Germany', lat: 49.4269, lng: 7.7556, aliases: ['1. FC Kaiserslautern'], venues: ['Fritz-Walter-Stadion'] },
  { city: 'Hanover', country: 'Germany', lat: 52.3601, lng: 9.7316, aliases: ['Hannover 96'], venues: ['Heinz von Heiden Arena'] },
  { city: 'Nuremberg', country: 'Germany', lat: 49.4265, lng: 11.1259, aliases: ['1. FC Nürnberg', 'FC Nürnberg'], venues: ['Max-Morlock-Stadion'] },
  { city: 'Berlin', country: 'Germany', lat: 52.5147, lng: 13.2395, aliases: ['Hertha BSC'], venues: ['Olympiastadion Berlin'] },
  { city: 'Magdeburg', country: 'Germany', lat: 52.1259, lng: 11.6349, aliases: ['1. FC Magdeburg'], venues: ['Avnet Arena', 'MDCC-Arena'] },
  { city: 'Gelsenkirchen', country: 'Germany', lat: 51.5548, lng: 7.0675, aliases: ['FC Schalke 04'], venues: ['VELTINS-Arena'] },
  { city: 'Elversberg', country: 'Germany', lat: 49.3498, lng: 7.1391, aliases: ['SV 07 Elversberg', 'SV Elversberg'], venues: ['URSAPHARM-Arena an der Kaiserlinde'] },
  { city: 'Braunschweig', country: 'Germany', lat: 52.2689, lng: 10.5216, aliases: ['Eintracht Braunschweig'], venues: ['Eintracht-Stadion'] },
  { city: 'Greuther Fürth', country: 'Germany', lat: 49.4875, lng: 10.991, aliases: ['SpVgg Greuther Fürth'], venues: ['Sportpark Ronhof | Thomas Sommer'] },
  { city: 'Münster', country: 'Germany', lat: 51.9626, lng: 7.6256, aliases: ['SC Preußen Münster', 'Preußen Münster'], venues: ['Preußenstadion'] },
  { city: 'Ulm', country: 'Germany', lat: 48.3998, lng: 9.9918, aliases: ['SSV Ulm 1846'], venues: ['Donaustadion'] },
  { city: 'Darmstadt', country: 'Germany', lat: 49.8728, lng: 8.6512, aliases: ['SV Darmstadt 98'], venues: ['Merck-Stadion am Böllenfalltor'] },
  { city: 'Regensburg', country: 'Germany', lat: 49.0138, lng: 12.1426, aliases: ['SSV Jahn Regensburg', 'Jahn Regensburg'], venues: ['Jahnstadion Regensburg'] },
  { city: 'Rostock', country: 'Germany', lat: 54.0851, lng: 12.1531, aliases: ['Hansa Rostock', 'FC Hansa Rostock'], venues: ['Ostseestadion'] },
  { city: 'Bielefeld', country: 'Germany', lat: 52.0302, lng: 8.5169, aliases: ['Arminia Bielefeld', 'DSC Arminia Bielefeld'], venues: ['SchücoArena'] }
];

const COUNTRY_CENTROIDS = {
  Germany: { lat: 51.1657, lng: 10.4515 },
  Spain: { lat: 40.4637, lng: -3.7492 },
  France: { lat: 46.2276, lng: 2.2137 },
  England: { lat: 52.3555, lng: -1.1743 },
  Italy: { lat: 41.8719, lng: 12.5674 },
  Europe: { lat: 54.526, lng: 15.2551 }
};

const normalizeLookupKey = (value = '') =>
  String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const LOCATION_BY_TEAM = new Map();
const LOCATION_BY_VENUE = new Map();

for (const location of CLUB_LOCATIONS) {
  for (const alias of location.aliases ?? []) {
    LOCATION_BY_TEAM.set(normalizeLookupKey(alias), location);
  }

  for (const venue of location.venues ?? []) {
    LOCATION_BY_VENUE.set(normalizeLookupKey(venue), location);
  }
}

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

const resolveLookupLocation = (rawLocationHints = {}) => {
  const venueKey = normalizeLookupKey(rawLocationHints.venueName);
  const teamKey = normalizeLookupKey(rawLocationHints.homeTeamName);

  const locationByVenue = venueKey ? LOCATION_BY_VENUE.get(venueKey) : null;
  if (locationByVenue) {
    return {
      ...locationByVenue,
      locationPrecision: 'stadium',
      locationSource: 'lookup',
      locationConfidence: 0.9
    };
  }

  const locationByTeam = teamKey ? LOCATION_BY_TEAM.get(teamKey) : null;
  if (locationByTeam) {
    return {
      ...locationByTeam,
      locationPrecision: 'city',
      locationSource: 'lookup',
      locationConfidence: 0.8
    };
  }

  return null;
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
    resolveLookupLocation(rawLocationHints) ??
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
