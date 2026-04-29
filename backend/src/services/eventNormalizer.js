import { getVenueLocation, getVenueLocationByHomeTeam } from './venueLocationLookup.js';

const HIGH_RISK_COMPETITIONS = new Set(['BL1', 'DFB']);

const normalizeRisk = ({ competitionCode, homeTeam, awayTeam }) => {
  const names = `${homeTeam} ${awayTeam}`.toLowerCase();
  const hasDerbySignal = names.includes('bayern') && names.includes('dortmund');

  if (hasDerbySignal || HIGH_RISK_COMPETITIONS.has(competitionCode)) {
    return { riskCategory: 'high', riskScore: 0.8 };
  }

  if (competitionCode === 'BL2') {
    return { riskCategory: 'medium', riskScore: 0.55 };
  }

  return { riskCategory: 'low', riskScore: 0.3 };
};

const fallbackId = (prefix, homeTeam, awayTeam, startTimeUtc) =>
  `${prefix}-${homeTeam}-${awayTeam}-${startTimeUtc}`.toLowerCase().replace(/\s+/g, '-');

export const normalizeFootballDataEvent = (match) => {
  const homeTeam = match.homeTeam?.name ?? 'Unknown Home';
  const awayTeam = match.awayTeam?.name ?? 'Unknown Away';
  const startTimeUtc = match.utcDate ?? new Date().toISOString();
  const competitionCode = match.competition?.code ?? 'UNKNOWN';
  const risk = normalizeRisk({ competitionCode, homeTeam, awayTeam });
  const venueNameFromApi = match.venue ?? null;
  const venueLocation = getVenueLocationByHomeTeam(homeTeam) ?? getVenueLocation(venueNameFromApi);
  const venueName = venueLocation?.venueName ?? venueNameFromApi ?? 'Unknown Venue';

  return {
    id: `football-data-${match.id ?? fallbackId('fd', homeTeam, awayTeam, startTimeUtc)}`,
    source: 'football-data',
    competition: match.competition?.name ?? 'Unknown Competition',
    competitionCode,
    homeTeam,
    awayTeam,
    startTimeUtc,
    venueName,
    lat: venueLocation?.lat ?? null,
    lng: venueLocation?.lng ?? null,
    city: venueLocation?.city ?? null,
    country: venueLocation?.country ?? match.area?.name ?? 'Europe',
    locationPrecision: venueLocation ? 'exact' : 'unknown',
    riskCategory: risk.riskCategory,
    riskScore: risk.riskScore
  };
};

export const normalizeOpenLigaEvent = (match) => {
  const homeTeam = match.team1?.teamName ?? 'Unknown Home';
  const awayTeam = match.team2?.teamName ?? 'Unknown Away';
  const startTimeUtc = match.matchDateTimeUTC ?? new Date().toISOString();
  const groupName = match.group?.groupName ?? 'OpenLiga Match';
  const risk = normalizeRisk({ competitionCode: 'BL1', homeTeam, awayTeam });

  const coordinates = (match.location?.locationGeoCoordinates ?? '').split(',').map((value) => Number(value.trim()));
  const [lat, lng] = coordinates.length === 2 && coordinates.every((value) => !Number.isNaN(value))
    ? coordinates
    : [null, null];

  return {
    id: `open-liga-${match.matchID ?? fallbackId('ol', homeTeam, awayTeam, startTimeUtc)}`,
    source: 'open-liga',
    competition: groupName,
    competitionCode: 'BL1',
    homeTeam,
    awayTeam,
    startTimeUtc,
    venueName: match.location?.locationStadium ?? match.location?.locationName ?? 'Unknown Venue',
    lat,
    lng,
    city: match.location?.locationCity ?? null,
    country: 'Germany',
    riskCategory: risk.riskCategory,
    riskScore: risk.riskScore
  };
};

export const normalizeEvents = (providerName, matches = []) => {
  if (providerName === 'football-data') {
    return matches.map(normalizeFootballDataEvent);
  }

  if (providerName === 'open-liga') {
    return matches.map(normalizeOpenLigaEvent);
  }

  return [];
};
