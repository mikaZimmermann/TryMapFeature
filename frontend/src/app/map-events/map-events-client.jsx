"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import BaseLayout from 'components/BaseLayout';
import { mapConfig } from 'lib/config';
import { getMapProviderStatus } from 'lib/map-provider-adapter';
import { getCompetitions, getMatches, getStandings } from 'lib/football-api-client';

const leagueOptions = ['BL1', 'BL2'];

export default function MapEventsClient() {
  const mapContainerRef = useRef(null);
  const [competition, setCompetition] = useState('BL1');
  const [competitions, setCompetitions] = useState([]);
  const [standings, setStandings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const providerStatus = useMemo(() => getMapProviderStatus(mapConfig), []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLeagueData() {
      setIsLoading(true);
      setError('');

      try {
        const [competitionList, standingsPayload, matchesPayload] = await Promise.all([
          getCompetitions({ signal: controller.signal }),
          getStandings({ competition, signal: controller.signal }),
          getMatches({ competition, signal: controller.signal })
        ]);

        setCompetitions(competitionList.filter((entry) => leagueOptions.includes(entry.code)));
        setStandings(Array.isArray(standingsPayload?.standings) ? standingsPayload.standings : []);
        setMatches(Array.isArray(matchesPayload) ? matchesPayload : []);
      } catch (requestError) {
        if (requestError?.name === 'AbortError') return;
        setCompetitions([]);
        setStandings([]);
        setMatches([]);
        setError(requestError?.message || 'Unable to load league data.');
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

        <label htmlFor="league">League:</label>{' '}
        <select id="league" value={competition} onChange={(event) => setCompetition(event.target.value)}>
          {leagueOptions.map((code) => (
            <option key={code} value={code}>{code}</option>
          ))}
        </select>

        {providerStatus.hasRequiredCredentials ? (
          <div className="map-canvas-wrapper">
            <div className="map-overlay">{competition} fixtures</div>
            <div ref={mapContainerRef} className="map-canvas" />
            <p className="map-note">Tile provider: {providerStatus.provider}</p>
          </div>
        ) : (
          <div className="map-placeholder">
            <p>{providerStatus.provider} is selected but missing required credentials.</p>
            <p>Set `NEXT_PUBLIC_MAP_API_KEY` to render tiles.</p>
          </div>
        )}

        <h2>League data</h2>
        {isLoading && <p>Loading standings and matches…</p>}
        {!isLoading && error && (
          <>
            <div role="alert" className="error-panel">
              <strong>Could not fetch league data.</strong>
              <p>{error}</p>
            </div>
            <div role="status" aria-live="polite" className="toast-error">
              {error}
            </div>
          </>
        )}
        {hasNoData && (
          <p role="status" className="no-data-state">
            No standings or matches were returned by upstream providers.
          </p>
        )}

        {!isLoading && !error && (
          <>
            <p>Competitions from backend: {competitions.map((entry) => entry.code).join(', ') || 'none'}</p>
            <h3>Standings</h3>
            {standings.length === 0 ? <p>No standings returned.</p> : (
              <ol>
                {standings.map((row) => (
                  <li key={row.team?.id || `${row.rank}-${row.team?.name}`}>{row.rank}. {row.team?.name} ({row.points} pts)</li>
                ))}
              </ol>
            )}

            <h3>Matches</h3>
            {matches.length === 0 ? <p>No matches returned.</p> : (
              <ul>
                {matches.map((match) => (
                  <li key={match.id}>{match.homeTeam?.name} vs {match.awayTeam?.name} • {match.status} • {match.utcDate}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </BaseLayout>
  );
}
