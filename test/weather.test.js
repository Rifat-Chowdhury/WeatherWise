import assert from 'node:assert/strict';
import test from 'node:test';

import { looksLikePostalCode, validDateRange } from '../server/weather.js';
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
