"use client";

import { useEffect, useMemo, useState } from 'react';
import BaseLayout from 'components/BaseLayout';
import { mapConfig } from 'lib/config';
import { getMapProviderStatus } from 'lib/map-provider-adapter';
import { getApiBaseUrlConfigWarning, getCompetitions, getMatches, getStandings } from 'lib/football-api-client';

const leagueOptions = ['BL1', 'BL2'];

export default function MapEventsClient() {
  const [competition, setCompetition] = useState('BL1');
  const [competitions, setCompetitions] = useState([]);
  const [standings, setStandings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationStatus, setLocationStatus] = useState('Requesting browser location…');
  const [debugLog, setDebugLog] = useState([]);

  const providerStatus = useMemo(() => getMapProviderStatus(mapConfig), []);
  const apiBaseUrlConfigWarning = useMemo(() => getApiBaseUrlConfigWarning(), []);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus(`Location granted: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
      },
      (geoError) => {
        setLocationStatus(`Location unavailable: ${geoError.message}`);
      }
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLeagueData() {
      setIsLoading(true);
      setError('');

      try {
        const [competitionResult, standingsResult, matchesResult] = await Promise.all([
          getCompetitions({ signal: controller.signal }),
          getStandings({ competition, signal: controller.signal }),
          getMatches({ competition, signal: controller.signal })
        ]);

        setCompetitions(competitionResult.data.filter((entry) => leagueOptions.includes(entry.code)));
        setStandings(Array.isArray(standingsResult.data?.standings) ? standingsResult.data.standings : []);
        setMatches(Array.isArray(matchesResult.data) ? matchesResult.data : []);
        setDebugLog([
          competitionResult.requestLog,
          standingsResult.requestLog,
          matchesResult.requestLog,
          {
            upstreamStandings: standingsResult.upstreamLog,
            upstream: matchesResult.upstreamLog,
            matchesReceived: matchesResult.data
          }
        ]);
      } catch (requestError) {
        if (requestError?.name === 'AbortError') return;
        setCompetitions([]);
        setStandings([]);
        setMatches([]);
        setDebugLog(requestError?.details ? [requestError.details] : []);
        const isMatchesRouteNotFound = requestError?.status === 404;
        setError(
          isMatchesRouteNotFound
            ? 'The backend returned HTTP 404 for /api/football/matches. Verify NEXT_PUBLIC_API_BASE_URL points to the deployed backend origin and that /api/football/matches is available.'
            : (requestError?.message || 'Unable to load league data.')
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadLeagueData();
    return () => controller.abort();
  }, [competition]);

  const hasNoData = !isLoading && !error && standings.length === 0 && matches.length === 0;

  return (
    <BaseLayout>
      <section>
        <h1>Map Events</h1>
        <p>Provider: <strong>{providerStatus.provider}</strong></p>
        <p>{locationStatus}</p>

        <label htmlFor="league">League:</label>{' '}
        <select id="league" value={competition} onChange={(event) => setCompetition(event.target.value)}>
          {leagueOptions.map((code) => (
            <option key={code} value={code}>{code}</option>
          ))}
        </select>

        <div className="map-placeholder">
          <p>Map is temporarily in diagnostic mode while fixing rendering issues.</p>
        </div>

        <h2>League data</h2>
        {apiBaseUrlConfigWarning && <div role="alert" className="error-panel"><p>{apiBaseUrlConfigWarning}</p></div>}
        {isLoading && <p>Loading standings and matches…</p>}
        {!isLoading && error && <div role="alert" className="error-panel"><p>{error}</p></div>}
        {hasNoData && <p role="status" className="no-data-state">No standings or matches were returned by upstream providers.</p>}

        {!isLoading && !error && (
          <>
            <p>Competitions from backend: {competitions.map((entry) => entry.code).join(', ') || 'none'}</p>
            <h3>Matches (table)</h3>
            {matches.length === 0 ? <p>No matches returned.</p> : (
              <table>
                <thead>
                  <tr><th>Date</th><th>Home</th><th>Away</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {matches.map((match) => (
                    <tr key={match.id}>
                      <td>{match.utcDate}</td><td>{match.homeTeam?.name}</td><td>{match.awayTeam?.name}</td><td>{match.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        <h3>Request / upstream debug log</h3>
        <pre>{JSON.stringify(debugLog, null, 2)}</pre>
      </section>
    </BaseLayout>
  );
}
