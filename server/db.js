import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.resolve('data');
fs.mkdirSync(dataDir, { recursive: true });
export const db = new DatabaseSync(path.join(dataDir, 'weather.db'));
db.exec(`CREATE TABLE IF NOT EXISTS weather_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT, location TEXT NOT NULL, latitude REAL NOT NULL,
  longitude REAL NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL,
  weather_json TEXT NOT NULL, notes TEXT DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
)`);

export function listRecords() {
  return db.prepare('SELECT id, location, latitude, longitude, start_date AS startDate, end_date AS endDate, notes, created_at AS createdAt, updated_at AS updatedAt FROM weather_requests ORDER BY id DESC').all();
}
export function getRecord(id) {
  const row = db.prepare('SELECT * FROM weather_requests WHERE id = ?').get(id);
  return row ? { id: row.id, location: row.location, latitude: row.latitude, longitude: row.longitude, startDate: row.start_date, endDate: row.end_date, notes: row.notes, createdAt: row.created_at, updatedAt: row.updated_at, weather: JSON.parse(row.weather_json) } : null;
}
export function createRecord(input, weather) {
  const now = new Date().toISOString();
  const result = db.prepare('INSERT INTO weather_requests (location, latitude, longitude, start_date, end_date, weather_json, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(input.location, weather.location.latitude, weather.location.longitude, input.startDate, input.endDate, JSON.stringify(weather), input.notes || '', now, now);
  return getRecord(Number(result.lastInsertRowid));
}
export function updateRecord(id, notes) {
  const result = db.prepare('UPDATE weather_requests SET notes = ?, updated_at = ? WHERE id = ?').run(notes, new Date().toISOString(), id);
  return result.changes ? getRecord(id) : null;
}
export function deleteRecord(id) { return db.prepare('DELETE FROM weather_requests WHERE id = ?').run(id).changes > 0; }
