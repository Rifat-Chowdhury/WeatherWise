import express from 'express';
import path from 'node:path';
import { createRecord, deleteRecord, getRecord, listRecords, updateRecord } from './db.js';
import { geocode, getWeather, normalize, reverseGeocode, validDateRange } from './weather.js';

const app = express();
app.use(express.json({ limit: '1mb' }));

const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/weather', asyncRoute(async (req, res) => {
  const place = req.query.lat && req.query.lon ? await reverseGeocode(Number(req.query.lat), Number(req.query.lon)) : await geocode(String(req.query.location || ''));
  res.json(normalize(place, await getWeather(place)));
}));
app.get('/api/records', (_req, res) => res.json(listRecords()));
app.get('/api/records/:id', (req, res) => { const record = getRecord(Number(req.params.id)); return record ? res.json(record) : res.status(404).json({ error: 'Record not found.' }); });
app.post('/api/records', asyncRoute(async (req, res) => {
  const { location, startDate, endDate, notes = '' } = req.body;
  if (!validDateRange(startDate, endDate)) return res.status(400).json({ error: 'Use valid dates with the end on/after the start and a maximum range of 16 days.' });
  const today = new Date().toISOString().slice(0, 10);
  const max = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);
  if (startDate < today || endDate > max) return res.status(400).json({ error: `Forecast dates must be between ${today} and ${max}.` });
  const place = await geocode(location);
  const weather = normalize(place, await getWeather(place, startDate, endDate));
  res.status(201).json(createRecord({ location: `${place.name}${place.country ? `, ${place.country}` : ''}`, startDate, endDate, notes: String(notes).slice(0, 300) }, weather));
}));
app.patch('/api/records/:id', (req, res) => {
  if (typeof req.body.notes !== 'string') return res.status(400).json({ error: 'Notes must be text.' });
  const record = updateRecord(Number(req.params.id), req.body.notes.trim().slice(0, 300));
  return record ? res.json(record) : res.status(404).json({ error: 'Record not found.' });
});
app.delete('/api/records/:id', (req, res) => deleteRecord(Number(req.params.id)) ? res.status(204).end() : res.status(404).json({ error: 'Record not found.' }));
app.get('/api/export.:format', (req, res) => {
  const rows = listRecords();
  if (req.params.format === 'json') { res.attachment('weather-records.json'); return res.json(rows); }
  if (req.params.format !== 'csv') return res.status(400).json({ error: 'Supported formats: csv, json.' });
  const fields = ['id','location','latitude','longitude','startDate','endDate','notes','createdAt','updatedAt'];
  const esc = v => `"${String(v ?? '').replaceAll('"', '""')}"`;
  res.attachment('weather-records.csv').type('text/csv').send([fields.join(','), ...rows.map(r => fields.map(f => esc(r[f])).join(','))].join('\n'));
});

app.use(express.static(path.resolve('dist')));
app.get('/{*splat}', (_req, res) => res.sendFile(path.resolve('dist/index.html')));
app.use((err, _req, res, _next) => { console.error(err); res.status(err.status || 500).json({ error: err.status ? err.message : 'Unexpected server error. Please try again.' }); });
app.listen(process.env.PORT || 3000, () => console.log(`WeatherWise running at http://localhost:${process.env.PORT || 3000}`));
