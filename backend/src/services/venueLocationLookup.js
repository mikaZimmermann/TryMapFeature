const STADIUM_LOCATION_LOOKUP = {
  'allianz arena': { venueName: 'Allianz Arena', city: 'Munich', country: 'Germany', lat: 48.2188, lng: 11.6247 },
  'signal iduna park': { venueName: 'Signal Iduna Park', city: 'Dortmund', country: 'Germany', lat: 51.4926, lng: 7.4519 },
  'bayarena': { venueName: 'BayArena', city: 'Leverkusen', country: 'Germany', lat: 51.0382, lng: 7.0023 },
  'deutsche bank park': { venueName: 'Deutsche Bank Park', city: 'Frankfurt', country: 'Germany', lat: 50.0686, lng: 8.6455 },
  'mhp arena': { venueName: 'MHP Arena', city: 'Stuttgart', country: 'Germany', lat: 48.7923, lng: 9.232 },
  'wohninvest weserstadion': { venueName: 'wohninvest WESERSTADION', city: 'Bremen', country: 'Germany', lat: 53.0664, lng: 8.837 },
  'red bull arena': { venueName: 'Red Bull Arena', city: 'Leipzig', country: 'Germany', lat: 51.3458, lng: 12.3486 },
  'volkswagen arena': { venueName: 'Volkswagen Arena', city: 'Wolfsburg', country: 'Germany', lat: 52.4319, lng: 10.8038 },
  'borussia-park': { venueName: 'BORUSSIA-PARK', city: 'Monchengladbach', country: 'Germany', lat: 51.1746, lng: 6.3852 },
  'wwk arena': { venueName: 'WWK Arena', city: 'Augsburg', country: 'Germany', lat: 48.3234, lng: 10.8862 },
  'vonovia ruhrstadion': { venueName: 'Vonovia Ruhrstadion', city: 'Bochum', country: 'Germany', lat: 51.4904, lng: 7.2369 },
  'stadion an der alten forsterei': { venueName: 'Stadion An der Alten Forsterei', city: 'Berlin', country: 'Germany', lat: 52.4572, lng: 13.5682 },
  'prezero arena': { venueName: 'PreZero Arena', city: 'Sinsheim', country: 'Germany', lat: 49.2386, lng: 8.8877 },
  'europa-park stadion': { venueName: 'Europa-Park Stadion', city: 'Freiburg', country: 'Germany', lat: 47.9978, lng: 7.8296 },
  'rheinenergiestadion': { venueName: 'RheinEnergieSTADION', city: 'Cologne', country: 'Germany', lat: 50.9339, lng: 6.8754 },
  'merkur spiel-arena': { venueName: 'MERKUR SPIEL-ARENA', city: 'Dusseldorf', country: 'Germany', lat: 51.2612, lng: 6.7338 },
  'holstein-stadion': { venueName: 'Holstein-Stadion', city: 'Kiel', country: 'Germany', lat: 54.3337, lng: 10.1228 },
  'voith-arena': { venueName: 'Voith-Arena', city: 'Heidenheim', country: 'Germany', lat: 48.6765, lng: 10.1536 },
  'millerntor-stadion': { venueName: 'Millerntor-Stadion', city: 'Hamburg', country: 'Germany', lat: 53.5547, lng: 9.9674 }
};

const HOME_TEAM_TO_STADIUM = {
  'bayern munchen': 'allianz arena',
  'borussia dortmund': 'signal iduna park',
  'bayer 04 leverkusen': 'bayarena',
  'eintracht frankfurt': 'deutsche bank park',
  'vfb stuttgart': 'mhp arena',
  'werder bremen': 'wohninvest weserstadion',
  'rb leipzig': 'red bull arena',
  'vfl wolfsburg': 'volkswagen arena',
  'borussia monchengladbach': 'borussia-park',
  'augsburg': 'wwk arena',
  'vfl bochum': 'vonovia ruhrstadion',
  'union berlin': 'stadion an der alten forsterei',
  'hoffenheim': 'prezero arena',
  'sc freiburg': 'europa-park stadion',
  'koln': 'rheinenergiestadion',
  'fortuna dusseldorf': 'merkur spiel-arena',
  'holstein kiel': 'holstein-stadion',
  'heidenheim': 'voith-arena',
  'st pauli': 'millerntor-stadion'
};

const normalizeKey = (value = '') =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\./g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\b(fc|sc|sv|vfb|vfl|tsg|spvgg|ssv|eintracht|borussia|club)\b/g, ' ')
    .replace(/\b\d+\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const getVenueLocation = (venueName) => STADIUM_LOCATION_LOOKUP[normalizeKey(venueName)] ?? null;

export const getVenueLocationByHomeTeam = (homeTeamName) => {
  const normalizedTeamName = normalizeKey(homeTeamName);
  const direct = HOME_TEAM_TO_STADIUM[normalizedTeamName];
  if (direct) return STADIUM_LOCATION_LOOKUP[direct] ?? null;

  const fuzzyMatch = Object.entries(HOME_TEAM_TO_STADIUM).find(([teamKey]) =>
    normalizedTeamName.includes(teamKey) || teamKey.includes(normalizedTeamName)
  );

  if (!fuzzyMatch) return null;
  return STADIUM_LOCATION_LOOKUP[fuzzyMatch[1]] ?? null;
};

export const debugVenueLookup = (homeTeamName, venueName) => {
  const normalizedTeamName = normalizeKey(homeTeamName);
  const normalizedVenueName = normalizeKey(venueName);
  const mappedStadiumKey = HOME_TEAM_TO_STADIUM[normalizedTeamName] ?? null;
  const byTeam = mappedStadiumKey ? STADIUM_LOCATION_LOOKUP[mappedStadiumKey] ?? null : null;
  const byVenue = normalizedVenueName ? STADIUM_LOCATION_LOOKUP[normalizedVenueName] ?? null : null;

  return {
    homeTeamName,
    venueName,
    normalizedTeamName,
    normalizedVenueName,
    mappedStadiumKey,
    resolvedByTeam: Boolean(byTeam),
    resolvedByVenue: Boolean(byVenue)
  };
};
