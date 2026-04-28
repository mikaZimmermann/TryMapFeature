"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BaseLayout from 'components/BaseLayout';
import { mapConfig } from 'lib/config';
import { getMapProviderStatus } from 'lib/map-provider-adapter';

const sampleEvents = [
  { id: 1, title: 'Downtown Night Market', lat: 37.7866, lng: -122.4041 },
  { id: 2, title: 'Waterfront Concert', lat: 37.808, lng: -122.4177 }
];

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

function parseBoolean(value) {
  if (!value) return false;
  return value === '1' || value.toLowerCase() === 'true';
}

function centerFromEvents(events) {
  if (!events.length) {
    return [37.7866, -122.4041];
  }

  const totals = events.reduce(
    (acc, event) => ({
      lat: acc.lat + Number(event.lat),
      lng: acc.lng + Number(event.lng)
    }),
    { lat: 0, lng: 0 }
  );

  return [totals.lat / events.length, totals.lng / events.length];
}

export default function MapEventsClient() {
  const searchParams = useSearchParams();
  const mapContainerRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [syncMetadata, setSyncMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const providerStatus = useMemo(() => getMapProviderStatus(mapConfig), []);

  const queryString = useMemo(() => {
    const nextQuery = new URLSearchParams();
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const forceRefresh = parseBoolean(searchParams.get('forceRefresh'));

    if (dateFrom) nextQuery.set('dateFrom', dateFrom);
    if (dateTo) nextQuery.set('dateTo', dateTo);
    if (forceRefresh) nextQuery.set('forceRefresh', 'true');

    return nextQuery.toString();
  }, [searchParams]);

  const endpoint = useMemo(() => {
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    if (dateFrom || dateTo) {
      const baseParams = new URLSearchParams(queryString);
      if (!baseParams.has('competitionCode')) {
        baseParams.set('competitionCode', 'CL');
      }
      return `${apiBaseUrl}/api/v1/events${baseParams.toString() ? `?${baseParams.toString()}` : ''}`;
    }

    const todayParams = new URLSearchParams(queryString);
    return `${apiBaseUrl}/api/v1/events/champions-league/today${
      todayParams.toString() ? `?${todayParams.toString()}` : ''
    }`;
  }, [queryString, searchParams]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(endpoint, {
          signal: controller.signal,
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        setEvents(Array.isArray(payload?.data) ? payload.data : []);
        setSyncMetadata({
          sync: payload?.sync,
          lastIngestedAt: payload?.lastIngestedAt
        });
      } catch (requestError) {
        if (requestError?.name === 'AbortError') {
          return;
        }

        setEvents([]);
        setSyncMetadata(null);
        setError(requestError?.message || 'Unable to load events.');
      } finally {
        setIsLoading(false);
      }
    }

    loadEvents();

    return () => controller.abort();
  }, [endpoint]);

  const eventsToRender = events.length > 0 ? events : sampleEvents;

  useEffect(() => {
    let leafletMap;

    async function mountTileMap() {
      if (!mapContainerRef.current || !providerStatus.tileUrl || !providerStatus.hasRequiredCredentials) {
        return;
      }

      const leaflet = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      const center = centerFromEvents(eventsToRender);

      leafletMap = leaflet.map(mapContainerRef.current, {
        center,
        zoom: 13,
        scrollWheelZoom: false
      });

      leaflet
        .tileLayer(providerStatus.tileUrl, {
          maxZoom: 19,
          attribution: providerStatus.tileAttribution
        })
        .addTo(leafletMap);

      eventsToRender.forEach((event) => {
        const lat = Number(event.lat);
        const lng = Number(event.lng);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          return;
        }

        leaflet
          .marker([lat, lng])
          .addTo(leafletMap)
          .bindPopup(
            `${event.homeTeam || 'Home'} vs ${event.awayTeam || 'Away'}${
              event.locationPrecision === 'approximate' ? ' (approx. location)' : ''
            }`
          );
      });
    }

    mountTileMap();

    return () => {
      if (leafletMap) {
        leafletMap.remove();
      }
    };
  }, [eventsToRender, providerStatus]);

  return (
    <BaseLayout>
      <section>
        <h1>Map Events</h1>
        <p>
          Provider: <strong>{providerStatus.provider}</strong>
        </p>

        {providerStatus.hasRequiredCredentials ? (
          <div className="map-canvas-wrapper">
            <div ref={mapContainerRef} className="map-canvas" />
            <p className="map-note">Tile provider: {providerStatus.provider}</p>
          </div>
        ) : (
          <div className="map-placeholder">
            <p>{providerStatus.provider} is selected but missing required credentials.</p>
            <p>Set `NEXT_PUBLIC_MAP_API_KEY` to render tiles.</p>
          </div>
        )}

        <p>
          API key status: <strong>{providerStatus.credentialMessage}</strong>
        </p>
        {!providerStatus.hasRequiredCredentials && (
          <p role="alert">This provider requires `NEXT_PUBLIC_MAP_API_KEY`.</p>
        )}

        <h2>Event feed</h2>
        {isLoading && <p>Loading events…</p>}
        {!isLoading && error && <p role="alert">Could not fetch events: {error}</p>}
        {!isLoading && !error && events.length === 0 && (
          <p>No events returned by the API. Showing fallback sample events.</p>
        )}
        {!isLoading && !error && syncMetadata && (
          <p>
            Sync: <strong>{String(syncMetadata.sync ?? 'unknown')}</strong>{' '}
            {syncMetadata.lastIngestedAt ? `• Last ingested: ${syncMetadata.lastIngestedAt}` : ''}
          </p>
        )}

        <ul>
          {eventsToRender.map((event, index) => {
            const eventKey = event.id || `${event.title || 'event'}-${index}`;
            const displayLabel = event.title
              ? event.title
              : `${event.homeTeam || 'Home'} vs ${event.awayTeam || 'Away'} • ${event.competition || 'Unknown competition'}${
                  event.startTimeUtc ? ` • ${event.startTimeUtc}` : ''
                }`;
            return (
              <li key={eventKey}>{displayLabel} ({event.lat}, {event.lng})</li>
            );
          })}
        </ul>
      </section>
    </BaseLayout>
  );
}
