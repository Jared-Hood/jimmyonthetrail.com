# Jimmy on the Trail

Jimmy's 2022 Appalachian Trail thru-hike journal: [jimmyonthetrail.com](https://jimmyonthetrail.com).
157 days from Springer Mountain, Georgia to Mount Katahdin, Maine, with a daily journal, photos,
a map, his gear list and the guestbook from the trip.

Built with [Astro 7](https://astro.build), Tailwind CSS v4 (via `@tailwindcss/vite`) and the
`@tailwindcss/typography` plugin. The output is a fully static site in `dist/`.

## Requirements

- **Node 24.** Astro 7 needs Node `>=22.23.4` (see `engines` in `package.json`); the nvm default
  on this machine (22.23.1) is too old, so run `nvm use 24` first.
- `npm install`

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server at http://localhost:4321 |
| `npx astro dev --background` | Same, in the background (`astro dev stop`, `astro dev status`, `astro dev logs`); see `AGENTS.md` |
| `npm run build` | Build the static site into `dist/` (165 pages) |
| `npm run preview` | Serve the built `dist/` locally |
| `npx astro check` | Type and template checks |

### Deploy

`npm run build` writes a fully static site to `dist/`. Deploy that folder to any static host.

- Astro builds with `build.format: 'file'` (`/blog/5` → `dist/blog/5.html`), so hosts serve clean
  URLs without a trailing slash.
- `public/_redirects` (301s from the old site's `.html` URLs, e.g. `/gear.html` → `/gear`,
  `/blog/5.html` → `/blog/5`) and `public/_headers` (a year of caching for `/_astro/*` and
  `/fonts/*`, `no-cache` for HTML pages) are copied into `dist/` and honored by Cloudflare
  (Pages / Workers static assets) and Netlify. Other hosts need the equivalent settings.
- The Adventure Mapper embed on `/map` only renders on allowed domains: localhost,
  `jimmyonthetrail.com` and `jimmyonthetrail-com.jaredhfootball.workers.dev`. A new host or
  preview domain must be added on the Adventure Mapper side, or the map shows an empty frame.

## Routes

| Route | Source |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/gear` | `src/pages/gear.astro` (data in `src/data/gear.ts`) |
| `/blog` | `src/pages/blog/index.astro`: day cards grouped by state, with search |
| `/blog/0` … `/blog/157` | `src/pages/blog/[day].astro`, one page per day. Day 0 (the approach trail) has a page but is left out of the blog list |
| `/map` | `src/pages/map.astro`: Adventure Mapper embed (`src/components/TrailMap.astro`) |
| `/wishes` | `src/pages/wishes.astro`: the guestbook, frozen as static |
| `/gallery` | `src/pages/gallery.astro`: masonry rows (`src/lib/galleryRows.ts`) |
| 404 | `src/pages/404.astro` (noindex) |

## Project structure

```
src/
  pages/            routes (above)
  layouts/          BaseLayout.astro: head, header, footer, breadcrumbs JSON-LD, fade-ins
  components/       Header (incl. mobile menu), Footer, SEO, JsonLd, PageHeader, DayCard,
                    PhotoViewer (full-screen viewer for gallery and day photos), TrailMap,
                    MilesProgress
  lib/              days.ts (collection helpers, mileage), states.ts (state from lat/long),
                    daySeo.ts (day titles/descriptions), mapLink.ts (map deep links),
                    schema.ts (shared JSON-LD), galleryRows.ts (gallery layout)
  content/days/     000.md … 157.md, one Markdown file per day (schema in src/content.config.ts)
  assets/           images processed by astro:assets: images/ (home, logo), days/, gallery/
  data/             site.ts (site info, nav, page titles/descriptions, map embed)
                    gear.ts, gallery-alt.ts
                    wishes.json (frozen guestbook export) + wishes-moderation.ts
                    at-states.json (14 AT state boundaries, build-time only)
                    adventuremapper-stops.json (day → Adventure Mapper stop/day IDs)
  styles/global.css Tailwind theme tokens, fonts, prose styling
public/             favicons, fonts (WOFF2), robots.txt, site.webmanifest, _redirects, _headers
scripts/            one-off and maintenance scripts (below)
docs/               text-cleanup-changes.md: every spelling fix made to the journal text
```

### Day files

Each `src/content/days/NNN.md` has frontmatter, and the body is Jimmy's journal text (Markdown):

```yaml
---
day: 12
name: "Nantahala Outdoor Center"
date: 2022-03-25
lat: 35.334445
long: -83.592567
mileage: 11.74
altitude: 1792          # optional
images:                 # optional; paths are relative to src/assets/days
  - src: "3-25/1.jpg"
    alt: "Jimmy in a selfie on an overlook above mountain ridges"
blog_entry: true        # optional, carried over from the old data
---
```

The state, miles so far and miles to Katahdin are derived at build time, nothing is stored by hand.

### Scripts

| Script | Purpose |
| --- | --- |
| `scripts/json-to-markdown.mjs` | One-off: converted the old `blog_data.json` into `src/content/days/*.md`. Pass the JSON path; it refuses to overwrite existing files unless `--force` (the files have been edited since) |
| `scripts/build-at-states.mjs` | Rebuilds `src/data/at-states.json` from `us-atlas` (dev dependency) |
| `scripts/measure-page-bytes.mjs` | Estimates a built page's download size at a viewport, e.g. `node scripts/measure-page-bytes.mjs gallery.html 390 3` |

## How to…

**Edit a day's text.** Edit the body of `src/content/days/NNN.md`. Blank lines make paragraphs.

**Add photos to a day.** Put the files under `src/assets/days/` (any subfolder) and list them in
the day's `images` with `src` (relative to `src/assets/days`) and `alt`. Alt text is required: the
build fails without it. The first photo becomes the lead photo; the rest show as thumbnails, and
all open in the full-screen viewer.

**Add a gallery photo.** Add `galleryNN.png` (next number) to `src/assets/gallery/` and its alt
text in `src/data/gallery-alt.ts` under that number (the build fails if it's missing). Photos are
shown in number order.

**Hide or show a guestbook message.** `src/data/wishes.json` is a frozen export of the old
site's guestbook (the guestbook is closed); leave it as is. Add or
remove its `id` in `src/data/wishes-moderation.ts` (`hiddenPranks` or `hiddenFragments`);
`messageOverrides` fixes a message's display text.

## Map

- `/map` embeds the Adventure Mapper trip `F4bMyTEJHf`; the URL, title and links live in
  `trailMap` in `src/data/site.ts`.
- The embed only loads on allowed sites (see Deploy above).
- **Deep links:** `/map?stop=STOPID&day=DAYID` passes Adventure Mapper's own 8-character
  alphanumeric short IDs through to the embed (`?stop=…&day=…`); invalid values are ignored.
  `src/data/adventuremapper-stops.json` maps each site day to its stop (and, for 2nd+ days at a
  multi-day stop, `amDay`). Day pages build their "See on the map" link with `getMapLink(day)`
  in `src/lib/mapLink.ts`.
- **TODO:** `trailMap.tripUrl` points at the Adventure Mapper home page because the trip has no
  public page yet. Replace it with the public `https://adventuremapper.com/@username/slug` URL once
  published; the links under the map, in the footer and on day pages all use it.

## SEO

- Sitemap generated by `@astrojs/sitemap` (`/sitemap-index.xml`, 404 excluded), linked from
  `public/robots.txt`.
- Per-page titles and descriptions in `src/data/site.ts` (day pages: `src/lib/daySeo.ts`),
  canonical URLs, Open Graph and Twitter cards (`src/components/SEO.astro`).
- JSON-LD: WebSite and Person on home, BreadcrumbList on every page below home, BlogPosting per
  day, Blog, ImageGallery, the map page as a WebPage about the thru-hike, and the gear ItemList.
- After launch: submit `https://jimmyonthetrail.com/sitemap-index.xml` in Google Search Console.
