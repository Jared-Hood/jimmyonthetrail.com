import stops from '../data/adventuremapper-stops.json';

/**
 * Deep links from a trail day to its place in the AdventureMapper embed.
 *
 * AdventureMapper addresses a stop (and optionally one day inside that stop) with its own
 * eight-character alphanumeric short IDs, e.g. ?stop=Ab12Cd34&day=Xy98Zw76. They are not
 * numbers or indexes. Fill src/data/adventuremapper-stops.json with one entry per site day:
 *   { "day": 12, "stop": "Ab12Cd34", "amDay": "Xy98Zw76" }   (amDay is optional)
 */
export interface StopMapping {
  /** Day number on this site (0–157). */
  day: number;
  /** AdventureMapper stop short ID. */
  stop: string;
  /** AdventureMapper day short ID within that stop (optional). */
  amDay?: string;
}

/** Same rule as AdventureMapper's isShortId. */
export const isShortId = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z0-9]{8}$/.test(value);

const byDay = new Map<number, StopMapping>();
for (const entry of stops as StopMapping[]) {
  if (!Number.isInteger(entry.day) || !isShortId(entry.stop)) {
    throw new Error(`Invalid AdventureMapper mapping: ${JSON.stringify(entry)}`);
  }
  if (entry.amDay !== undefined && !isShortId(entry.amDay)) {
    throw new Error(`Invalid AdventureMapper day id for day ${entry.day}: ${entry.amDay}`);
  }
  byDay.set(entry.day, entry);
}

/** /map?stop=…&day=… when the day has a mapping, otherwise /map. */
export function getMapLink(day: number): string {
  const entry = byDay.get(day);
  if (!entry) return '/map';
  const params = new URLSearchParams({ stop: entry.stop });
  if (entry.amDay) params.set('day', entry.amDay);
  return `/map?${params}`;
}
