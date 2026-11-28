#!/usr/bin/env node
/**
 * Builds the default social share card: public/og/default.png (1200×630).
 *
 * Layout: the Katahdin summit photo on the right, a dark brown panel on the left with the site
 * logo, a short line in Montserrat and the trail facts. The card is laid out in HTML (so the
 * site's own fonts and logo render exactly), screenshotted with headless Chrome, then
 * compressed with sharp (which Astro already installs).
 *
 *   node scripts/build-og-image.mjs
 *   CHROME_PATH=/path/to/chrome node scripts/build-og-image.mjs   # if Chrome is elsewhere
 */
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const out = path.join(root, 'public/og/default.png');
const file = (p) => pathToFileURL(path.join(root, p)).href;

const work = await mkdtemp(path.join(tmpdir(), 'og-card-'));

// Downscale the 12 MP photo first so Chrome renders quickly and predictably.
const photo = path.join(work, 'photo.jpg');
await sharp(path.join(root, 'src/assets/images/Summit.jpg')).rotate().resize({ width: 1100 }).jpeg({ quality: 90 }).toFile(photo);

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family: Montserrat; font-weight: 300; src: url('${file('public/fonts/Montserrat-ExtraLight.woff2')}') format('woff2'); }
  @font-face { font-family: Montserrat; font-weight: 500; src: url('${file('public/fonts/Montserrat-Medium.woff2')}') format('woff2'); }
  * { margin: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; background: #413333; }
  .card { position: relative; width: 1200px; height: 630px; display: flex; }
  .text { position: relative; z-index: 2; width: 640px; padding: 64px 0 56px 72px; display: flex; flex-direction: column; color: #f4e0cb; font-family: Montserrat, sans-serif; }
  .logo { width: 470px; height: auto; display: block; }
  .rule { width: 72px; height: 3px; background: #d4927b; margin: 40px 0 28px; }
  .line { font-weight: 500; font-size: 33px; line-height: 1.25; letter-spacing: 0.01em; }
  .facts { margin-top: 18px; font-weight: 500; font-size: 22px; letter-spacing: 0.14em; text-transform: uppercase; color: #d4927b; }
  .site { margin-top: auto; font-weight: 500; font-size: 20px; letter-spacing: 0.08em; color: #c9b19a; }
  .photo { position: absolute; inset: 0 0 0 auto; width: 640px; height: 630px; object-fit: cover; object-position: 50% 42%; }
  /* Scrim: the brown panel fades into the photo so the edge doesn't look pasted on. */
  .scrim { position: absolute; inset: 0 0 0 auto; width: 640px; background: linear-gradient(90deg, #413333 0%, rgba(65,51,51,0.55) 22%, rgba(65,51,51,0) 48%); z-index: 1; }
  .frame { position: absolute; inset: 14px; border: 1px solid rgba(244,224,203,0.35); z-index: 3; pointer-events: none; }
</style></head><body>
  <div class="card">
    <img class="photo" src="${pathToFileURL(photo).href}" alt="">
    <div class="scrim"></div>
    <div class="text">
      <img class="logo" src="${file('src/assets/images/logo.png')}" alt="">
      <div class="rule"></div>
      <p class="line">Appalachian Trail thru-hike<br>Georgia to Maine &middot; 2022</p>
      <p class="facts">2,194.3 miles &middot; 157 days</p>
      <p class="site">jimmyonthetrail.com</p>
    </div>
    <div class="frame"></div>
  </div>
</body></html>`;

const htmlPath = path.join(work, 'card.html');
const shot = path.join(work, 'card.png');
await writeFile(htmlPath, html);

execFileSync(chrome, [
  '--headless=new',
  '--no-first-run',
  `--user-data-dir=${path.join(work, 'profile')}`,
  '--hide-scrollbars',
  '--allow-file-access-from-files',
  '--force-device-scale-factor=1',
  '--window-size=1200,630',
  '--virtual-time-budget=5000',
  `--screenshot=${shot}`,
  pathToFileURL(htmlPath).href,
], { stdio: 'ignore' });

await mkdir(path.dirname(out), { recursive: true });
const png = await sharp(await readFile(shot))
  .resize(1200, 630, { fit: 'cover' })
  .png({ palette: true, quality: 90, effort: 10, dither: 0.6 })
  .toBuffer();
await writeFile(out, png);
await rm(work, { recursive: true, force: true });

const meta = await sharp(out).metadata();
console.log(`Wrote public/og/default.png (${meta.width}×${meta.height}, ${(png.length / 1024).toFixed(0)} KB)`);
