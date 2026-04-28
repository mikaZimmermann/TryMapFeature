"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BaseLayout from 'components/BaseLayout';
import { mapConfig } from 'lib/config';

const sampleEvents = [
  { id: 1, title: 'Downtown Night Market', lat: 37.7866, lng: -122.4041 },
  { id: 2, title: 'Waterfront Concert', lat: 37.808, lng: -122.4177 }
];

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

function parseBoolean(value) {
  if (!value) return false;
  return value === '1' || value.toLowerCase() === 'true';
}

export default function MapEventsClient() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState([]);
  const [syncMetadata, setSyncMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      setIsLoading(true);
      setError('');

      try {
        const endpoint = `${apiBaseUrl}/api/v1/events${queryString ? `?${queryString}` : ''}`;
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
  }, [queryString]);

  const eventsToRender = events.length > 0 ? events : sampleEvents;

  return (
    <BaseLayout>
      <section>
        <h1>Map Events</h1>
        <p>
          Provider: <strong>{mapConfig.provider}</strong>
        </p>

        <div className="map-placeholder">
          <p>Map container placeholder (wire your map SDK here).</p>
          <p>
            API key status: <strong>{mapConfig.apiKey ? 'Configured' : 'Missing'}</strong>
          </p>
        </div>

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
            return (
              <li key={eventKey}>
                {event.title} ({event.lat}, {event.lng})
              </li>
            );
          })}
        </ul>
      </section>
    </BaseLayout>
  );
}
