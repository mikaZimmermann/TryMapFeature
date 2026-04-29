const STADIUM_LOCATION_LOOKUP = {
  'allianz arena': { venueName: 'Allianz Arena', city: 'Munich', country: 'Germany', lat: 48.2188, lng: 11.6247 },
  'signal iduna park': { venueName: 'Signal Iduna Park', city: 'Dortmund', country: 'Germany', lat: 51.4926, lng: 7.4519 },
  bayarena: { venueName: 'BayArena', city: 'Leverkusen', country: 'Germany', lat: 51.0382, lng: 7.0023 },
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
  rheinenergiestadion: { venueName: 'RheinEnergieSTADION', city: 'Cologne', country: 'Germany', lat: 50.9339, lng: 6.8754 },
  'merkur spiel-arena': { venueName: 'MERKUR SPIEL-ARENA', city: 'Dusseldorf', country: 'Germany', lat: 51.2612, lng: 6.7338 },
  'holstein-stadion': { venueName: 'Holstein-Stadion', city: 'Kiel', country: 'Germany', lat: 54.3337, lng: 10.1228 },
  'voith-arena': { venueName: 'Voith-Arena', city: 'Heidenheim', country: 'Germany', lat: 48.6765, lng: 10.1536 },
  'millerntor-stadion': { venueName: 'Millerntor-Stadion', city: 'Hamburg', country: 'Germany', lat: 53.5547, lng: 9.9674 }
};

const normalizeKey = (value = '') =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\./g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\b(fc|sc|sv|tsg|spvgg|ssv)\b/g, ' ')
    .replace(/\b\d+\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const HOME_TEAM_TO_STADIUM_RAW = {
  'FC Bayern München': 'allianz arena',
  'Borussia Dortmund': 'signal iduna park',
  'Bayer 04 Leverkusen': 'bayarena',
  'Eintracht Frankfurt': 'deutsche bank park',
  'VfB Stuttgart': 'mhp arena',
  'SV Werder Bremen': 'wohninvest weserstadion',
  'RB Leipzig': 'red bull arena',
  'VfL Wolfsburg': 'volkswagen arena',
  'Borussia Mönchengladbach': 'borussia-park',
  'FC Augsburg': 'wwk arena',
  'VfL Bochum 1848': 'vonovia ruhrstadion',
  '1. FC Union Berlin': 'stadion an der alten forsterei',
  'TSG Hoffenheim': 'prezero arena',
  'SC Freiburg': 'europa-park stadion',
  '1. FC Köln': 'rheinenergiestadion',
  'Fortuna Düsseldorf': 'merkur spiel-arena',
  'Holstein Kiel': 'holstein-stadion',
  '1. FC Heidenheim 1846': 'voith-arena',
  'FC St. Pauli': 'millerntor-stadion'
};

const HOME_TEAM_TO_STADIUM = Object.fromEntries(
  Object.entries(HOME_TEAM_TO_STADIUM_RAW).map(([team, stadium]) => [normalizeKey(team), stadium])
);

export const getVenueLocation = (venueName) => STADIUM_LOCATION_LOOKUP[normalizeKey(venueName)] ?? null;

export const getVenueLocationByHomeTeam = (homeTeamName) => {
  const normalizedTeamName = normalizeKey(homeTeamName);
  const direct = HOME_TEAM_TO_STADIUM[normalizedTeamName];
  if (direct) return STADIUM_LOCATION_LOOKUP[direct] ?? null;

  const fuzzyMatch = Object.entries(HOME_TEAM_TO_STADIUM).find(([teamKey]) =>
    normalizedTeamName.includes(teamKey) || teamKey.includes(normalizedTeamName)
  );

  return fuzzyMatch ? STADIUM_LOCATION_LOOKUP[fuzzyMatch[1]] ?? null : null;
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
    resolvedByVenue: Boolean(byVenue),
    availableTeamMappings: Object.keys(HOME_TEAM_TO_STADIUM).slice(0, 30)
  };
};
