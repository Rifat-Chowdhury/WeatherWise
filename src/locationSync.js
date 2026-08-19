export function syncRangeLocation(currentLocation, place) {
  const current = (currentLocation ?? '').trim();
  const next = (place?.name ?? '').trim();

  if (!next) return current;
  if (!current || current === 'Current location') return next;
  return current;
}
