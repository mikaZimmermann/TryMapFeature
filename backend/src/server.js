if (!process.env.FOOTBALL_DATA_API_KEY) {
  throw new Error('FOOTBALL_DATA_API_KEY is required at startup. Set FOOTBALL_DATA_API_KEY in .env or deployment environment settings.');
}

const { default: app } = await import('./app.js');

const port = process.env.PORT || 4000;

console.log('[startup] FOOTBALL_DATA_API_KEY detected for football-data provider.');

app.listen(port, () => {
  console.log(`Event API listening on http://localhost:${port}`);
});
