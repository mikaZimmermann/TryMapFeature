if (!process.env.FOOTBALL_DATA_API_KEY) {
  throw new Error('FOOTBALL_DATA_API_KEY is required at startup');
}

const { default: app } = await import('./app.js');

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Event API listening on http://localhost:${port}`);
});
