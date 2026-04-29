import { enrichEventLocation } from './locationEnricher.js';

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

  const normalized = {
    id: `football-data-${match.id ?? fallbackId('fd', homeTeam, awayTeam, startTimeUtc)}`,
    source: 'football-data',
    competition: match.competition?.name ?? 'Unknown Competition',
    competitionCode,
    homeTeam,
    awayTeam,
    startTimeUtc,
    venueName: match.venue ?? 'Unknown Venue',
    lat: null,
    lng: null,
    city: null,
    country: null,
    locationPrecision: 'unknown',
    locationSource: 'unknown',
    locationConfidence: 0,
    rawLocationHints: {
      venueName: match.venue ?? null,
      areaName: match.area?.name ?? match.competition?.area?.name ?? null,
      areaCode: match.area?.code ?? match.competition?.area?.code ?? null,
      areaFlag: match.area?.flag ?? match.competition?.area?.flag ?? null,
      competitionName: match.competition?.name ?? null,
      competitionCode,
      homeTeamName: homeTeam,
      awayTeamName: awayTeam,
      providerLat: match.venueCoordinates?.lat ?? match.location?.lat ?? null,
      providerLng: match.venueCoordinates?.lng ?? match.location?.lng ?? null,
      providerCity: match.city ?? match.location?.city ?? null,
      providerCountry: match.country ?? match.location?.country ?? null,
      matchId: match.id ?? null
    },
    riskCategory: risk.riskCategory,
    riskScore: risk.riskScore
  };

  return enrichEventLocation(normalized);
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
    locationPrecision: lat !== null && lng !== null ? 'exact' : 'city',
    locationSource: lat !== null && lng !== null ? 'provider' : 'derived',
    locationConfidence: lat !== null && lng !== null ? 1 : 0.6,
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
