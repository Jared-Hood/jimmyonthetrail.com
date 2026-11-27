#!/usr/bin/env node
/**
 * Estimates how many bytes a built page downloads at a given viewport, by reading the
 * built HTML in dist/ and picking each <img>'s srcset candidate the way a browser would
 * (evaluates `sizes`, multiplies by device pixel ratio, takes the smallest candidate that
 * covers it). Counts every image on the page (as if scrolled to the bottom), plus HTML,
 * CSS and JS. Images only fetched on interaction (the gallery viewer) are not counted.
 *
 *   node scripts/measure-page-bytes.mjs gallery.html 390 3
 */
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const [page = 'index.html', vw = '1440', dpr = '1'] = process.argv.slice(2);
const viewport = Number(vw);
const ratio = Number(dpr);
const dist = 'dist';
const html = readFileSync(path.join(dist, page), 'utf8');
const size = (url) => statSync(path.join(dist, decodeURIComponent(url.split('?')[0]))).size;

const toPx = (value) => {
  const n = parseFloat(value);
  if (value.endsWith('rem') || value.endsWith('em')) return n * 16;
  if (value.endsWith('vw')) return (n / 100) * viewport;
  return n;
};

function slotWidth(sizes) {
  for (const part of sizes.split(',').map((s) => s.trim())) {
    const match = /^\(min-width:\s*([\d.]+(?:px|rem|em))\)\s+(.+)$/.exec(part);
    if (!match) return evalLength(part);
    if (viewport >= toPx(match[1])) return evalLength(match[2]);
  }
  return viewport;
}

function evalLength(expr) {
  const calc = /^calc\((.+)\)$/.exec(expr);
  if (!calc) return toPx(expr);
  // Supports "a - b", "a + b", "(a - b) / n" style expressions used on this site.
  const js = calc[1].replace(/([\d.]+)(px|rem|em|vw)/g, (m) => String(toPx(m)));
  return Function(`return (${js})`)();
}

let imageBytes = 0;
let images = 0;
for (const tag of html.match(/<img\b[^>]*>/g) ?? []) {
  const srcset = /srcset="([^"]+)"/.exec(tag)?.[1];
  const src = /src="([^"]+)"/.exec(tag)?.[1];
  const sizes = /sizes="([^"]+)"/.exec(tag)?.[1];
  let chosen = src;
  if (srcset) {
    const candidates = srcset.split(',').map((c) => {
      const [url, descriptor = '1x'] = c.trim().split(/\s+/);
      return { url, w: descriptor.endsWith('w') ? parseFloat(descriptor) : null, x: descriptor.endsWith('x') ? parseFloat(descriptor) : null };
    });
    if (candidates[0].w) {
      const needed = (sizes ? slotWidth(sizes) : viewport) * ratio;
      const sorted = candidates.sort((a, b) => a.w - b.w);
      chosen = (sorted.find((c) => c.w >= needed) ?? sorted.at(-1)).url;
    } else {
      const sorted = candidates.sort((a, b) => a.x - b.x);
      chosen = (sorted.find((c) => c.x >= ratio) ?? sorted.at(-1)).url;
    }
  }
  if (!chosen || !chosen.startsWith('/')) continue;
  imageBytes += size(chosen);
  images += 1;
}

let assetBytes = statSync(path.join(dist, page)).size;
for (const [, url] of html.matchAll(/(?:href|src)="(\/_astro\/[^"]+\.(?:css|js))"/g)) assetBytes += size(url);

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
console.log(`${page} @ ${viewport}px x${ratio}: ${images} images ${kb(imageBytes)} + html/css/js ${kb(assetBytes)} = ${kb(imageBytes + assetBytes)}`);
