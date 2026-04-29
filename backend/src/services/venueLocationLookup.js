const VENUE_LOCATION_LOOKUP = {
  // Bundesliga (BL1)
  'allianz arena': { city: 'Munich', country: 'Germany', lat: 48.2188, lng: 11.6247 },
  'signal iduna park': { city: 'Dortmund', country: 'Germany', lat: 51.4926, lng: 7.4519 },
  'bayarena': { city: 'Leverkusen', country: 'Germany', lat: 51.0382, lng: 7.0023 },
  'deutsche bank park': { city: 'Frankfurt', country: 'Germany', lat: 50.0686, lng: 8.6455 },
  'mhparena': { city: 'Stuttgart', country: 'Germany', lat: 48.7923, lng: 9.232 },
  'wohninvest weserstadion': { city: 'Bremen', country: 'Germany', lat: 53.0664, lng: 8.837 },
  'red bull arena': { city: 'Leipzig', country: 'Germany', lat: 51.3458, lng: 12.3486 },
  'volkswagen arena': { city: 'Wolfsburg', country: 'Germany', lat: 52.4319, lng: 10.8038 },
  'borussia-park': { city: 'Monchengladbach', country: 'Germany', lat: 51.1746, lng: 6.3852 },
  'wwk arena': { city: 'Augsburg', country: 'Germany', lat: 48.3234, lng: 10.8862 },
  'vonovia ruhrstadion': { city: 'Bochum', country: 'Germany', lat: 51.4904, lng: 7.2369 },
  'alte forsterei': { city: 'Berlin', country: 'Germany', lat: 52.4572, lng: 13.5682 },
  'mhp arena': { city: 'Ludwigsburg', country: 'Germany', lat: 48.8974, lng: 9.1844 },
  'prezero arena': { city: 'Sinsheim', country: 'Germany', lat: 49.2386, lng: 8.8877 },
  'europa-park stadion': { city: 'Freiburg', country: 'Germany', lat: 47.9978, lng: 7.8296 },
  'rheinenergiestadion': { city: 'Cologne', country: 'Germany', lat: 50.9339, lng: 6.8754 },
  'merkur spiel-arena': { city: 'Dusseldorf', country: 'Germany', lat: 51.2612, lng: 6.7338 },
  'holstein-stadion': { city: 'Kiel', country: 'Germany', lat: 54.3337, lng: 10.1228 },
  'heidenheim stadion': { city: 'Heidenheim', country: 'Germany', lat: 48.6765, lng: 10.1536 },
  'millerntor-stadion': { city: 'Hamburg', country: 'Germany', lat: 53.5547, lng: 9.9674 },

  // 2. Bundesliga (BL2)
  'veltins-arena': { city: 'Gelsenkirchen', country: 'Germany', lat: 51.5547, lng: 7.0672 },
  'volksparkstadion': { city: 'Hamburg', country: 'Germany', lat: 53.5872, lng: 9.8987 },
  'max-morlock-stadion': { city: 'Nuremberg', country: 'Germany', lat: 49.4269, lng: 11.1257 },
  'merck-stadion am böllenfalltor': { city: 'Darmstadt', country: 'Germany', lat: 49.8599, lng: 8.6728 },
  'fritz-walter-stadion': { city: 'Kaiserslautern', country: 'Germany', lat: 49.4362, lng: 7.7732 },
  'wildparkstadion': { city: 'Karlsruhe', country: 'Germany', lat: 49.0232, lng: 8.4219 },
  'heinz von heiden-arena': { city: 'Hanover', country: 'Germany', lat: 52.3602, lng: 9.7316 },
  'jahnstadion regensburg': { city: 'Regensburg', country: 'Germany', lat: 48.9981, lng: 12.1221 },
  'sportpark ronhof': { city: 'Furth', country: 'Germany', lat: 49.4875, lng: 10.9928 },
  'eintracht-stadion': { city: 'Braunschweig', country: 'Germany', lat: 52.2912, lng: 10.5218 },
  'ursapharm-arena': { city: 'Elversberg', country: 'Germany', lat: 49.357, lng: 7.1414 },
  'ostalb arena': { city: 'Ulm', country: 'Germany', lat: 48.4028, lng: 9.9932 },
  'hertha bsc stadion': { city: 'Berlin', country: 'Germany', lat: 52.5147, lng: 13.2394 },
  'sportclub arena': { city: 'Paderborn', country: 'Germany', lat: 51.7188, lng: 8.7611 },
  'avnet arena': { city: 'Magdeburg', country: 'Germany', lat: 52.1037, lng: 11.6327 }
};

const normalizeVenueKey = (venueName = '') =>
  venueName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const getVenueLocation = (venueName) => VENUE_LOCATION_LOOKUP[normalizeVenueKey(venueName)] ?? null;
