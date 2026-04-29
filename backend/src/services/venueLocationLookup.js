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
  'millerntor-stadion': { venueName: 'Millerntor-Stadion', city: 'Hamburg', country: 'Germany', lat: 53.5547, lng: 9.9674 },
  'veltins-arena': { venueName: 'VELTINS-Arena', city: 'Gelsenkirchen', country: 'Germany', lat: 51.5547, lng: 7.0672 },
  'volksparkstadion': { venueName: 'Volksparkstadion', city: 'Hamburg', country: 'Germany', lat: 53.5872, lng: 9.8987 },
  'max-morlock-stadion': { venueName: 'Max-Morlock-Stadion', city: 'Nuremberg', country: 'Germany', lat: 49.4269, lng: 11.1257 },
  'merck-stadion am bollenfalltor': { venueName: 'Merck-Stadion am Bollenfalltor', city: 'Darmstadt', country: 'Germany', lat: 49.8599, lng: 8.6728 },
  'fritz-walter-stadion': { venueName: 'Fritz-Walter-Stadion', city: 'Kaiserslautern', country: 'Germany', lat: 49.4362, lng: 7.7732 },
  'bbbank wildpark': { venueName: 'BBBank Wildpark', city: 'Karlsruhe', country: 'Germany', lat: 49.0232, lng: 8.4219 },
  'heinz von heiden-arena': { venueName: 'Heinz von Heiden-Arena', city: 'Hanover', country: 'Germany', lat: 52.3602, lng: 9.7316 },
  'jahnstadion regensburg': { venueName: 'Jahnstadion Regensburg', city: 'Regensburg', country: 'Germany', lat: 48.9981, lng: 12.1221 },
  'sportpark ronhof': { venueName: 'Sportpark Ronhof', city: 'Furth', country: 'Germany', lat: 49.4875, lng: 10.9928 },
  'eintracht-stadion': { venueName: 'Eintracht-Stadion', city: 'Braunschweig', country: 'Germany', lat: 52.2912, lng: 10.5218 },
  'ursapharm-arena': { venueName: 'URSAPHARM-Arena', city: 'Elversberg', country: 'Germany', lat: 49.357, lng: 7.1414 },
  'donaustadion': { venueName: 'Donaustadion', city: 'Ulm', country: 'Germany', lat: 48.4028, lng: 9.9932 },
  'olympiastadion berlin': { venueName: 'Olympiastadion Berlin', city: 'Berlin', country: 'Germany', lat: 52.5147, lng: 13.2394 },
  'home deluxe arena': { venueName: 'Home Deluxe Arena', city: 'Paderborn', country: 'Germany', lat: 51.7188, lng: 8.7611 },
  'avnet arena': { venueName: 'Avnet Arena', city: 'Magdeburg', country: 'Germany', lat: 52.1037, lng: 11.6327 }
};

const HOME_TEAM_TO_STADIUM = {
  'fc bayern munchen': 'allianz arena',
  'borussia dortmund': 'signal iduna park',
  'bayer 04 leverkusen': 'bayarena',
  'eintracht frankfurt': 'deutsche bank park',
  'vfb stuttgart': 'mhp arena',
  'sv werder bremen': 'wohninvest weserstadion',
  'rb leipzig': 'red bull arena',
  'vfl wolfsburg': 'volkswagen arena',
  'borussia monchengladbach': 'borussia-park',
  'fc augsburg': 'wwk arena',
  'vfl bochum 1848': 'vonovia ruhrstadion',
  '1. fc union berlin': 'stadion an der alten forsterei',
  'tsg 1899 hoffenheim': 'prezero arena',
  'sc freiburg': 'europa-park stadion',
  '1. fc koln': 'rheinenergiestadion',
  'fortuna dusseldorf': 'merkur spiel-arena',
  'holstein kiel': 'holstein-stadion',
  '1. fc heidenheim 1846': 'voith-arena',
  'fc st. pauli 1910': 'millerntor-stadion',
  'fc schalke 04': 'veltins-arena',
  'hamburger sv': 'volksparkstadion',
  '1. fc nurnberg': 'max-morlock-stadion',
  'sv darmstadt 98': 'merck-stadion am bollenfalltor',
  '1. fc kaiserslautern': 'fritz-walter-stadion',
  'karlsruher sc': 'bbbank wildpark',
  'hannover 96': 'heinz von heiden-arena',
  'ssv jahn regensburg': 'jahnstadion regensburg',
  'spvgg greuther furth': 'sportpark ronhof',
  'eintracht braunschweig': 'eintracht-stadion',
  'sv 07 elversberg': 'ursapharm-arena',
  'ssv ulm 1846': 'donaustadion',
  'hertha bsc': 'olympiastadion berlin',
  'sc paderborn 07': 'home deluxe arena',
  '1. fc magdeburg': 'avnet arena'
};

const normalizeKey = (value = '') =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const getVenueLocation = (venueName) => STADIUM_LOCATION_LOOKUP[normalizeKey(venueName)] ?? null;

export const getVenueLocationByHomeTeam = (homeTeamName) => {
  const stadiumKey = HOME_TEAM_TO_STADIUM[normalizeKey(homeTeamName)];
  return stadiumKey ? STADIUM_LOCATION_LOOKUP[stadiumKey] ?? null : null;
};
