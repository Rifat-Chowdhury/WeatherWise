import assert from 'node:assert/strict';
import test from 'node:test';

import { looksLikePostalCode, normalize, validDateRange } from '../server/weather.js';
import { syncRangeLocation } from '../src/locationSync.js';

test('validDateRange accepts valid forecast windows up to 15 days inclusive', () => {
  assert.equal(validDateRange('2026-08-19', '2026-08-19'), true);
  assert.equal(validDateRange('2026-08-19', '2026-08-30'), true);
  assert.equal(validDateRange('2026-08-19', '2026-09-03'), true);
  assert.equal(validDateRange('2026-08-19', '2026-09-04'), false);
  assert.equal(validDateRange('2026-08-20', '2026-08-19'), false);
});

test('syncRangeLocation keeps user input but fills blank or current-location placeholders', () => {
  assert.equal(syncRangeLocation('', { name: 'Toronto' }), 'Toronto');
  assert.equal(syncRangeLocation('Current location', { name: 'Vancouver' }), 'Vancouver');
  assert.equal(syncRangeLocation('Montreal', { name: 'Paris' }), 'Montreal');
  assert.equal(syncRangeLocation('   ', { name: 'Berlin' }), 'Berlin');
});

test('looksLikePostalCode recognizes common postal formats', () => {
  assert.equal(looksLikePostalCode('M5V'), true);
  assert.equal(looksLikePostalCode('M5V 1E3'), true);
  assert.equal(looksLikePostalCode('SW1A 1AA'), true);
  assert.equal(looksLikePostalCode('Toronto'), false);
  assert.equal(looksLikePostalCode('12345'), true);
});

test('normalize calculates saved weather metrics across selected dates', () => {
  const weather = {
    timezone: 'America/Toronto', current_units: {}, current: { weather_code: 0 },
    daily: { time: ['2026-08-25', '2026-08-26'], weather_code: [0, 0], temperature_2m_max: [20, 24], temperature_2m_min: [10, 14], temperature_2m_mean: [15, 19], precipitation_probability_max: [0, 0], sunrise: ['', ''], sunset: ['', ''], uv_index_max: [0, 0] },
    hourly: { time: ['2026-08-25T00:00', '2026-08-25T12:00', '2026-08-26T00:00', '2026-08-26T12:00'], relative_humidity_2m: [50, 70, 60, 80], wind_speed_10m: [10, 14, 8, 12] },
  };
  const result = normalize({ name: 'Toronto', latitude: 43.7, longitude: -79.4 }, weather);
  assert.deepEqual(result.summary, { dayCount: 2, averageTemperature: 17, averageHumidity: 65, averageWindSpeed: 11 });
  assert.equal(result.daily[0].averageHumidity, 60);
});
