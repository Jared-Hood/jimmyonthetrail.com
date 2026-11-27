import states from '../data/at-states.json';

/** The 14 Appalachian Trail states in trail order (Georgia to Maine). */
export const TRAIL_STATES = states.features.map((f) => f.properties.name);

type Ring = number[][];

/** Ray-casting point-in-ring test (lon/lat). */
function inRing([x, y]: [number, number], ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function inPolygon(point: [number, number], polygon: Ring[]): boolean {
  const [outer, ...holes] = polygon;
  return inRing(point, outer) && !holes.some((hole) => inRing(point, hole));
}

/** Rough squared distance in degrees, longitude scaled by latitude. */
function distance2([x, y]: [number, number], [px, py]: number[]): number {
  const dx = (x - px) * Math.cos((y * Math.PI) / 180);
  const dy = y - py;
  return dx * dx + dy * dy;
}

const cache = new Map<string, string>();

/**
 * Which AT state a point is in, from the bundled boundaries. Points that fall just outside
 * every polygon (simplified borders) get the state with the nearest boundary vertex.
 */
export function stateFor(lat: number, long: number): string {
  const key = `${lat},${long}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const point: [number, number] = [long, lat];
  let found = states.features.find((f) =>
    (f.geometry.coordinates as Ring[][]).some((polygon) => inPolygon(point, polygon)),
  )?.properties.name;

  if (!found) {
    let best = Infinity;
    for (const f of states.features) {
      for (const polygon of f.geometry.coordinates as Ring[][]) {
        for (const vertex of polygon[0]) {
          const d = distance2(point, vertex);
          if (d < best) {
            best = d;
            found = f.properties.name;
          }
        }
      }
    }
  }

  cache.set(key, found!);
  return found!;
}
