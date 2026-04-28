import cors from 'cors';
import express from 'express';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/events', (_req, res) => {
  res.json([
    { id: 'evt-1', name: 'Downtown Night Market', lat: 37.7866, lng: -122.4041 },
    { id: 'evt-2', name: 'Waterfront Concert', lat: 37.808, lng: -122.4177 }
  ]);
});

app.listen(port, () => {
  console.log(`Event API listening on http://localhost:${port}`);
});
