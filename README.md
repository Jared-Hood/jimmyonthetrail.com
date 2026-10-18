# Jimmy on the Trail

Jimmy “RocketMan” Hood’s 2022 Appalachian Trail archive, rebuilt with Astro and Tailwind CSS. The site is fully static and ready for Cloudflare Workers static assets or Cloudflare Pages. There is no Firebase dependency, database, map API key, or runtime server.

## Develop

Use Node.js 22.22 or newer.

```sh
npm ci
npm run dev -- --background
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

If the default port is in use, pass `--port 4350` when starting the background server. The command prints the preview URL.

```sh
npm run check
npm run build
npm run preview
```

## Content

- `src/content/blog/`: all 158 original daily entries, as editable Markdown files with validated frontmatter. Filenames and URLs preserve the original day numbers (0–157).
- `src/pages/`: Astro pages for the home, journal, map, gallery, gear, well wishes, and 404.
- `src/data/gear.json`: the complete original packing list.
- `src/data/trail.json`: the original Appalachian Trail centerline, retained as archive data. The route page uses an Adventure Mapper embed in `src/components/TrailMap.astro`.
- `src/data/wishes.json`: hardcoded well wishes, rendered as escaped text at build time.
- `public/images/`: every original photo and supporting image. `site/` contains the old source assets; the remaining directories preserve the old public photo structure.
- `public/images/optimized/`: smaller WebP derivatives used by the pages. Originals remain available, including in the gallery viewer.
- `public/fonts/`: the original locally hosted fonts.

To edit an entry, update its Markdown body or frontmatter and rebuild. `src/content.config.ts` defines the schema. The `day` field must be unique because it determines the public URL.

After adding/changing photos, run `npm run images`. The image helper uses the Sharp development dependency, to update generated WebP copies. Commit the image derivatives along with originals so Cloudflare only needs to run the site build.

## Well wishes archive

All 88 original well wishes have been imported from the supplied Firebase HTML export into `src/data/wishes.json`. Names, wording, repeated contributors, and export order are preserved; HTML entities are decoded and surrounding whitespace is trimmed. The page renders the messages as escaped text in a responsive, searchable archive. It has no submission form or Firebase connection.

To add or edit a message, use the same array format:

```json
[{ "name": "The original author", "message": "The original message" }]
```

Or import a JSON array / Firestore REST JSON export:

```sh
npm run import:wishes -- /absolute/path/to/comments.json
npm run build
```

The importer runs locally and does not contact Firebase. The site never requests credentials or reads Firebase at runtime.

## Cloudflare Workers (static assets)

`wrangler.jsonc` serves the Astro `dist` directory directly, with trailing-slash URLs and the custom 404 page. No Worker script, Astro adapter, database, or runtime secret is needed. The local CLI is a pinned development dependency.

```sh
npm run deploy:check
```

This builds and validates the upload without publishing. When you are ready, sign into the intended Cloudflare account through Wrangler, confirm the target Worker name in `wrangler.jsonc`, and run:

```sh
npm run deploy
```

For Workers Builds, use `npm run build` as the build command and `npx wrangler deploy` as the deploy command. Add the custom domain through Cloudflare when ready to switch traffic. No deployment has been performed during this migration.

Configuration follows [Cloudflare’s static site guidance](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/).

## Cloudflare Pages (alternative)

Connect this repository in Cloudflare Pages and use:

| Setting                | Value                                         |
| ---------------------- | --------------------------------------------- |
| Build command          | `npm run build`                               |
| Build output directory | `dist`                                        |
| Root directory         | Repository root                               |
| Node version           | 22.22 or newer (set `NODE_VERSION` if needed) |

No Astro adapter or environment secrets are required for this static output. The canonical production URL is `https://jimmyonthetrail.com` in `astro.config.mjs`; update it before deploying under a different permanent domain.

There are no custom redirects for legacy `.html` pages or `/public/images/…` image paths. Current `/blog/{day}/` links are served by the generated directories. Cloudflare Pages applies `_headers` for image/font caching and standard response headers. A generated `404.html` handles missing pages.

RSS is at `/rss.xml`; the sitemap is at `/sitemap.xml`.

## Migration notes

- Original journal text, dates, mileage, and coordinates are preserved. The historic homepage’s final distance of 2,194.3 miles is used for the summary statistics; daily mileage is displayed as recorded rather than silently reconciled.
- The homepage introduction, final reflection, and gear introduction retain Jimmy’s original wording. Editorial headings and supporting copy draw on his themes of following a dream, appreciating the people and places along the trail, and encouraging others to go. Attributed quotations reproduce his actual words; the Markdown journal entries remain unchanged. The original personal photos, portrait, skyline, and summit photo are retained.
- The gallery preserves all 87 original gallery photos. Daily journal photos stay with their respective entries.
- Firebase administration, live tracking, and comment submission are intentionally retired. The route represents the completed 2022 hike.
- No deployment has been performed as part of the migration.

## RocketMan branding

The logo is the 🚀 rocket emoji above a mountain ridge, on a transparent background. The header uses `public/brand/rocketman.svg`; the footer uses `public/brand/rocketman-light.svg` with a cream ridge for contrast. The favicon and home-screen icons use just the rocket on a cream background. The emoji is stored locally to keep the mark consistent across devices.

Run `npm run icons` after editing `scripts/build-brand.mjs` or the source emoji asset. This regenerates the SVG logo, SVG favicon, ICO, PNG favicons, and home-screen icons without requiring a system emoji font. The monochrome Safari pinned-tab icon is maintained in `public/safari-pinned-tab.svg`.
