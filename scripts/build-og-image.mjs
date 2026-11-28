#!/usr/bin/env node
/**
 * Builds the social share cards in public/og/ (all 1200×630):
 *
 *   default.png            home and 404 (Katahdin summit photo, logo, trail line)
 *   blog.jpg, gear.jpg,    section cards: page name in the Heading font beside a photo
 *   map.jpg, wishes.jpg,   (JPEG: mostly photo, so much smaller than PNG)
 *   gallery.jpg
 *   day/N.png              one per day WITHOUT photos (typographic: day, place, state, miles).
 *                          Days with photos use their lead photo instead.
 *
 * Cards are laid out in HTML (so the site's own fonts and logo render exactly), screenshotted
 * with headless Chrome a few at a time, then compressed with sharp (installed with Astro).
 *
 *   node scripts/build-og-image.mjs                 # everything
 *   node scripts/build-og-image.mjs default blog    # only these cards
 *   node scripts/build-og-image.mjs days            # only the day cards
 *   CHROME_PATH=/path/to/chrome node scripts/build-og-image.mjs
 *
 * Re-run after changing a day's name, mileage or photos, or the section photos below.
 */
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const outDir = path.join(root, 'public/og');
const file = (p) => pathToFileURL(path.join(root, p)).href;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const TRAIL_TOTAL_MILES = 2194.3;

/** Section cards: page name and the photo beside it (distinct photos, all from the site). */
const SECTIONS = {
  blog: { title: 'Trail Journal', line: '157 days on the Appalachian Trail', photo: 'src/assets/gallery/gallery3.png', focus: '50% 45%' },
  gear: { title: 'Gear List', line: 'What I carried from Georgia to Maine', photo: 'src/assets/gallery/gallery72.png', focus: '50% 50%' },
  map: { title: 'Interactive Map', line: 'Every stop from Springer to Katahdin', photo: 'src/assets/gallery/gallery68.png', focus: '50% 50%' },
  wishes: { title: 'Well Wishes', line: 'Messages from friends and family', photo: 'src/assets/gallery/gallery70.png', focus: '50% 45%' },
  gallery: { title: 'Photo Gallery', line: '87 photos from the Appalachian Trail', photo: 'src/assets/gallery/gallery26.png', focus: '50% 50%' },
};

const fonts = `
  @font-face { font-family: Heading; src: url('${file('public/fonts/Heading.woff2')}') format('woff2'); }
  @font-face { font-family: Montserrat; font-weight: 300; src: url('${file('public/fonts/Montserrat-ExtraLight.woff2')}') format('woff2'); }
  @font-face { font-family: Montserrat; font-weight: 500; src: url('${file('public/fonts/Montserrat-Medium.woff2')}') format('woff2'); }
  * { margin: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; background: #413333; }
  .card { position: relative; width: 1200px; height: 630px; display: flex; color: #f4e0cb; font-family: Montserrat, sans-serif; }
  .frame { position: absolute; inset: 14px; border: 1px solid rgba(244,224,203,0.35); z-index: 3; }
  .photo { position: absolute; inset: 0 0 0 auto; height: 630px; object-fit: cover; }
  .scrim { position: absolute; inset: 0 0 0 auto; z-index: 1; background: linear-gradient(90deg, #413333 0%, rgba(65,51,51,0.55) 22%, rgba(65,51,51,0) 48%); }
  .label { font-weight: 500; font-size: 22px; letter-spacing: 0.16em; text-transform: uppercase; color: #d4927b; }
  .site { font-weight: 500; font-size: 20px; letter-spacing: 0.08em; color: #c9b19a; }
`;

/** The original home card (unchanged design). */
const defaultCard = (photo) => `
  <style>${fonts}
    .text { position: relative; z-index: 2; width: 640px; padding: 64px 0 56px 72px; display: flex; flex-direction: column; }
    .logo { width: 470px; }
    .rule { width: 72px; height: 3px; background: #d4927b; margin: 40px 0 28px; }
    .line { font-weight: 500; font-size: 33px; line-height: 1.25; letter-spacing: 0.01em; }
    .facts { margin-top: 18px; font-weight: 500; font-size: 22px; letter-spacing: 0.14em; text-transform: uppercase; color: #d4927b; }
    .site { margin-top: auto; }
  </style>
  <div class="card">
    <img class="photo" style="width:640px; object-position:50% 42%" src="${photo}" alt="">
    <div class="scrim" style="width:640px"></div>
    <div class="text">
      <img class="logo" src="${file('src/assets/images/logo.png')}" alt="">
      <div class="rule"></div>
      <p class="line">Appalachian Trail thru-hike<br>Georgia to Maine &middot; 2022</p>
      <p class="facts">2,194.3 miles &middot; 157 days</p>
      <p class="site">jimmyonthetrail.com</p>
    </div>
    <div class="frame"></div>
  </div>`;

/** Section card: brand label, page name in the Heading font, one line, photo on the right. */
const sectionCard = ({ title, line, focus }, photo) => `
  <style>${fonts}
    .text { position: relative; z-index: 2; width: 640px; padding: 70px 0 56px 72px; display: flex; flex-direction: column; }
    .title { margin-top: 26px; font-family: Heading; font-size: 104px; line-height: 0.92; letter-spacing: 0.01em; }
    .rule { width: 72px; height: 3px; background: #d4927b; margin: 34px 0 26px; }
    .line { font-weight: 500; font-size: 30px; line-height: 1.3; max-width: 470px; }
    .site { margin-top: auto; }
  </style>
  <div class="card">
    <img class="photo" style="width:600px; object-position:${focus}" src="${photo}" alt="">
    <div class="scrim" style="width:600px"></div>
    <div class="text">
      <p class="label">Jimmy on the Trail</p>
      <h1 class="title">${esc(title)}</h1>
      <div class="rule"></div>
      <p class="line">${esc(line)}</p>
      <p class="site">jimmyonthetrail.com</p>
    </div>
    <div class="frame"></div>
  </div>`;

/** Day card (days without photos): typographic, with a progress bar along the trail. */
const dayCard = (d) => `
  <style>${fonts}
    .text { position: relative; width: 1200px; padding: 64px 72px 56px; display: flex; flex-direction: column; }
    .top { display: flex; justify-content: space-between; align-items: center; }
    .logo { width: 220px; }
    .row { display: flex; align-items: flex-end; gap: 40px; margin-top: 34px; }
    .num { font-family: Heading; font-size: 200px; line-height: 0.78; color: #d4927b; }
    .place { font-family: Heading; font-size: ${d.name.length > 26 ? 60 : 74}px; line-height: 0.98; max-width: 760px; }
    .meta { margin-top: 14px; font-weight: 500; font-size: 28px; color: #ead2b8; }
    .stats { margin-top: auto; display: flex; gap: 48px; font-weight: 500; font-size: 26px; }
    .stats span { display: block; font-size: 17px; letter-spacing: 0.16em; text-transform: uppercase; color: #c9b19a; margin-bottom: 6px; }
    .bar { margin-top: 26px; height: 6px; background: rgba(244,224,203,0.18); border-radius: 3px; overflow: hidden; }
    .bar div { height: 100%; background: #d4927b; }
  </style>
  <div class="card">
    <div class="text">
      <div class="top">
        <p class="label">Appalachian Trail thru-hike &middot; 2022</p>
        <img class="logo" src="${file('src/assets/images/logo.png')}" alt="">
      </div>
      <div class="row">
        <p class="num">${d.day}</p>
        <div>
          <p class="label" style="color:#c9b19a">Day ${d.day}</p>
          <h1 class="place">${esc(d.name)}</h1>
          <p class="meta">${esc(d.state)} &middot; ${esc(d.date)}</p>
        </div>
      </div>
      <div class="stats">
        <p><span>That day</span>${d.miles} mi</p>
        <p><span>So far</span>${d.soFar} of 2,194.3 mi</p>
        <p><span>Site</span>jimmyonthetrail.com</p>
      </div>
      <div class="bar"><div style="width:${d.percent}%"></div></div>
    </div>
    <div class="frame"></div>
  </div>`;

// ---------- Day data (read straight from the Markdown frontmatter) ----------

/** Mirrors src/lib/states.ts: point-in-polygon against src/data/at-states.json, else nearest. */
const states = JSON.parse(await readFile(path.join(root, 'src/data/at-states.json'), 'utf8'));
function inRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function stateFor(lat, long) {
  const p = [long, lat];
  const hit = states.features.find((f) =>
    f.geometry.coordinates.some(([outer, ...holes]) => inRing(p, outer) && !holes.some((h) => inRing(p, h))),
  );
  if (hit) return hit.properties.name;
  let best = Infinity;
  let name = '';
  for (const f of states.features)
    for (const poly of f.geometry.coordinates)
      for (const [x, y] of poly[0]) {
        const d = ((p[0] - x) * Math.cos((p[1] * Math.PI) / 180)) ** 2 + (p[1] - y) ** 2;
        if (d < best) [best, name] = [d, f.properties.name];
      }
  return name;
}

const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
const dateFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' });

async function loadDays() {
  const dir = path.join(root, 'src/content/days');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md')).sort();
  let running = 0;
  return Promise.all(
    files.map(async (f) => {
      const text = await readFile(path.join(dir, f), 'utf8');
      const fm = text.split('---')[1];
      const get = (key) => new RegExp(`^${key}: (.*)$`, 'm').exec(fm)?.[1]?.trim();
      return { fm, get };
    }),
  ).then((items) =>
    items.map(({ fm, get }) => {
      const mileage = Number(get('mileage'));
      running += mileage;
      const soFar = Math.round(running * 10) / 10;
      const lat = Number(get('lat'));
      const long = Number(get('long'));
      return {
        day: Number(get('day')),
        name: JSON.parse(get('name')),
        date: dateFmt.format(new Date(`${get('date')}T00:00:00Z`)),
        state: stateFor(lat, long),
        miles: fmt(mileage),
        soFar: fmt(soFar),
        percent: Math.min(100, (soFar / TRAIL_TOTAL_MILES) * 100).toFixed(1),
        hasPhotos: /^images:\s*\n\s+- /m.test(fm),
      };
    }),
  );
}

// ---------- Rendering ----------

const work = await mkdtemp(path.join(tmpdir(), 'og-cards-'));

/** Downscale a source photo so Chrome renders quickly. */
async function preparePhoto(src, name) {
  const out = path.join(work, `${name}.jpg`);
  await sharp(path.join(root, src)).rotate().resize({ width: 1000, withoutEnlargement: true }).jpeg({ quality: 90 }).toFile(out);
  return pathToFileURL(out).href;
}

async function render(name, body, outFile) {
  const htmlPath = path.join(work, `${name}.html`);
  const shot = path.join(work, `${name}.png`);
  await writeFile(htmlPath, `<!doctype html><html><head><meta charset="utf-8"></head><body>${body}</body></html>`);
  await run(chrome, [
    '--headless=new',
    '--no-first-run',
    `--user-data-dir=${path.join(work, `profile-${name}`)}`,
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    '--force-device-scale-factor=1',
    '--window-size=1200,630',
    '--virtual-time-budget=4000',
    `--screenshot=${shot}`,
    pathToFileURL(htmlPath).href,
  ]);
  // Section cards are mostly photo, so JPEG keeps them small; the rest are palette PNGs.
  const image = sharp(shot).resize(1200, 630, { fit: 'cover' });
  const buffer = outFile.endsWith('.jpg')
    ? await image.jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer()
    : await image.png({ palette: true, quality: 90, effort: 10, dither: 0.6 }).toBuffer();
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, buffer);
  return buffer.length;
}

/** Runs jobs a few at a time (each is a separate Chrome process). */
async function pool(jobs, size = 6) {
  const results = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (next < jobs.length) {
        const job = jobs[next++];
        results.push(await job());
      }
    }),
  );
  return results;
}

const wanted = new Set(process.argv.slice(2));
const want = (key) => wanted.size === 0 || wanted.has(key);

const jobs = [];
if (want('default')) {
  const photo = await preparePhoto('src/assets/images/Summit.jpg', 'summit');
  jobs.push(async () => ['default.png', await render('default', defaultCard(photo), path.join(outDir, 'default.png'))]);
}
for (const [key, section] of Object.entries(SECTIONS)) {
  if (!want(key)) continue;
  const photo = await preparePhoto(section.photo, key);
  jobs.push(async () => [`${key}.jpg`, await render(key, sectionCard(section, photo), path.join(outDir, `${key}.jpg`))]);
}
if (want('days')) {
  const days = await loadDays();
  // Remove cards for days that now have photos (or no longer exist).
  await rm(path.join(outDir, 'day'), { recursive: true, force: true });
  for (const d of days.filter((d) => !d.hasPhotos)) {
    jobs.push(async () => [`day/${d.day}.png`, await render(`day-${d.day}`, dayCard(d), path.join(outDir, 'day', `${d.day}.png`))]);
  }
}

const results = await pool(jobs);
await rm(work, { recursive: true, force: true });

const total = results.reduce((sum, [, bytes]) => sum + bytes, 0);
const largest = results.reduce((a, b) => (b[1] > a[1] ? b : a), ['', 0]);
console.log(`Wrote ${results.length} cards to public/og/ (${(total / 1024 / 1024).toFixed(2)} MB total; largest ${largest[0]} ${(largest[1] / 1024).toFixed(0)} KB)`);
