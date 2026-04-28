import { Suspense } from 'react';
import MapEventsClient from './map-events-client';

export default function MapEventsPage() {
  return (
    <Suspense fallback={<p>Loading map events…</p>}>
      <MapEventsClient />
    </Suspense>
  );
}
