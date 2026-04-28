import BaseLayout from 'components/BaseLayout';
import { mapConfig } from 'lib/config';

const sampleEvents = [
  { id: 1, title: 'Downtown Night Market', lat: 37.7866, lng: -122.4041 },
  { id: 2, title: 'Waterfront Concert', lat: 37.808, lng: -122.4177 }
];

export default function MapEventsPage() {
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
        <ul>
          {sampleEvents.map((event) => (
            <li key={event.id}>
              {event.title} ({event.lat}, {event.lng})
            </li>
          ))}
        </ul>
      </section>
    </BaseLayout>
  );
}
