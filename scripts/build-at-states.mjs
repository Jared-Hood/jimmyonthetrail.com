#!/usr/bin/env node
/**
 * One-off: writes src/data/at-states.json, the 14 Appalachian Trail states as a small
 * GeoJSON FeatureCollection (lon/lat, 3 decimals ≈ 100 m), used at build time to tell
 * which state each day's stop is in. Source: us-atlas (US Census cartographic boundaries).
 *
 *   node scripts/build-at-states.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';

const require = createRequire(import.meta.url);
const topology = JSON.parse(await readFile(require.resolve('us-atlas/states-10m.json'), 'utf8'));

// Trail order, Georgia to Maine.
const AT_STATES = [
  'Georgia', 'North Carolina', 'Tennessee', 'Virginia', 'West Virginia', 'Maryland',
  'Pennsylvania', 'New Jersey', 'New York', 'Connecticut', 'Massachusetts', 'Vermont',
  'New Hampshire', 'Maine',
];

const round = (n) => Math.round(n * 1000) / 1000;

/** Rounds coordinates and drops consecutive duplicates. */
function simplifyRing(ring) {
  const out = [];
  for (const [x, y] of ring) {
    const point = [round(x), round(y)];
    const last = out.at(-1);
    if (!last || last[0] !== point[0] || last[1] !== point[1]) out.push(point);
  }
  return out.length >= 4 ? out : null;
}

const all = feature(topology, topology.objects.states).features;
const features = AT_STATES.map((name, order) => {
  const state = all.find((f) => f.properties.name === name);
  if (!state) throw new Error(`State not found: ${name}`);
  const polygons = state.geometry.type === 'Polygon' ? [state.geometry.coordinates] : state.geometry.coordinates;
  const coordinates = polygons
    .map((polygon) => polygon.map(simplifyRing).filter(Boolean))
    .filter((polygon) => polygon.length > 0);
  return {
    type: 'Feature',
    properties: { name, order },
    geometry: { type: 'MultiPolygon', coordinates },
  };
});

await writeFile('src/data/at-states.json', JSON.stringify({ type: 'FeatureCollection', features }));
console.log(`Wrote ${features.length} states`);
