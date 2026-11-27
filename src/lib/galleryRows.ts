/**
 * Gallery rows: breaks a run of photos into editorial rows without cropping.
 *
 * Adapted from the AdventureMapper photo tour (photoRows.ts): every photo keeps its true
 * aspect ratio; inside a row each cell's flex-grow is its aspect ratio, so widths follow the
 * photos and the row lines up at one height. A stacked column (two photos on top of each
 * other) acts as one cell whose aspect makes its height match its neighbours.
 *
 * Landscape photos follow the AdventureMapper rules (pair, full-width hero, a portrait beside
 * two stacked landscapes). Runs of portraits rotate through several patterns so a gallery of
 * mostly portrait phone photos doesn't become a uniform grid, while keeping rows roughly
 * between one third and two thirds of a desktop screen tall.
 */

export interface Shaped {
  /** width / height */
  aspect: number;
}

export type Cell<T> = { kind: 'photo'; photo: T } | { kind: 'stack'; photos: [T, T] };

export interface Row<T> {
  pattern: 'quad' | 'feature-stacks' | 'trio' | 'strip' | 'stacks-feature' | 'pair' | 'hero' | 'solo' | 'vstack';
  cells: Cell<T>[];
}

const isPortrait = (p: Shaped) => p.aspect < 1;

/** Aspect of two photos stacked vertically (combined height = sum of heights at equal width). */
export const stackAspect = ([a, b]: [Shaped, Shaped]) => 1 / (1 / a.aspect + 1 / b.aspect);

export const cellAspect = <T extends Shaped>(cell: Cell<T>) =>
  cell.kind === 'photo' ? cell.photo.aspect : stackAspect(cell.photos);

const photo = <T>(p: T): Cell<T> => ({ kind: 'photo', photo: p });
const stack = <T>(a: T, b: T): Cell<T> => ({ kind: 'stack', photos: [a, b] });

/**
 * Rotating patterns for runs of portraits: [pattern, photos used].
 * quad: four in a row · feature-stacks: one large beside three stacked pairs (≈40% wide) ·
 * trio: three in a row · strip: five in a row · stacks-feature: the mirror of feature-stacks.
 */
const PORTRAIT_CYCLE = [
  ['quad', 4],
  ['feature-stacks', 7],
  ['trio', 3],
  ['strip', 5],
  ['stacks-feature', 7],
] as const;

export function buildGalleryRows<T extends Shaped>(photos: T[]): Row<T>[] {
  const rows: Row<T>[] = [];
  let cycle = 0;
  let i = 0;

  while (i < photos.length) {
    const p = photos[i];

    if (!isPortrait(p)) {
      const next = photos[i + 1];
      if (next && !isPortrait(next)) {
        rows.push({ pattern: 'pair', cells: [photo(p), photo(next)] });
        i += 2;
      } else {
        rows.push({ pattern: 'hero', cells: [photo(p)] });
        i += 1;
      }
      continue;
    }

    // Length of the run of portraits starting here.
    let run = 0;
    while (i + run < photos.length && isPortrait(photos[i + run])) run += 1;

    if (run === 1) {
      const [a, b] = [photos[i + 1], photos[i + 2]];
      if (a && b && !isPortrait(a) && !isPortrait(b)) {
        rows.push({ pattern: 'vstack', cells: [photo(p), stack(a, b)] });
        i += 3;
      } else if (a) {
        rows.push({ pattern: 'pair', cells: [photo(p), photo(a)] });
        i += 2;
      } else {
        rows.push({ pattern: 'solo', cells: [photo(p)] });
        i += 1;
      }
      continue;
    }

    // Pick the next pattern in the cycle that fits the run, avoiding leaving a single portrait.
    let chosen: (typeof PORTRAIT_CYCLE)[number] | undefined;
    for (let k = 0; k < PORTRAIT_CYCLE.length; k += 1) {
      const candidate = PORTRAIT_CYCLE[(cycle + k) % PORTRAIT_CYCLE.length];
      const left = run - candidate[1];
      if (left === 0 || left >= 2) {
        chosen = candidate;
        cycle = (cycle + k + 1) % PORTRAIT_CYCLE.length;
        break;
      }
    }
    const [pattern] = chosen ?? ['pair', 2];
    const g = photos.slice(i, i + (chosen?.[1] ?? 2));

    const cells: Cell<T>[] =
      pattern === 'feature-stacks'
        ? [photo(g[0]), stack(g[1], g[2]), stack(g[3], g[4]), stack(g[5], g[6])]
        : pattern === 'stacks-feature'
          ? [stack(g[0], g[1]), stack(g[2], g[3]), stack(g[4], g[5]), photo(g[6])]
          : g.map(photo);

    rows.push({ pattern, cells });
    i += g.length;
  }

  return rows;
}
