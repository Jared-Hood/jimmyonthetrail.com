#!/usr/bin/env node
/**
 * One-off conversion of the old site's blog_data.json into one Markdown file per day
 * (src/content/days/000.md … 157.md), which the "days" content collection now reads.
 *
 *   node scripts/json-to-markdown.mjs path/to/blog_data.json [--force]
 *
 * Defaults to src/data/blog_data.json. Refuses to overwrite existing day files (they have
 * been hand-edited since) unless --force is passed.
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const force = args.includes('--force');
const source = args.find((arg) => !arg.startsWith('--')) ?? 'src/data/blog_data.json';
const outDir = 'src/content/days';

/** "03/14/22" or "8/17/2022" -> "2022-03-14" */
function isoDate(value) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(String(value).trim());
  if (!match) throw new Error(`Unrecognized date "${value}"`);
  const [, month, day, rawYear] = match;
  const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// JSON strings are valid YAML scalars, so JSON.stringify gives safe quoting.
const yaml = (value) => JSON.stringify(value);

const { data } = JSON.parse(await readFile(source, 'utf8'));
await mkdir(outDir, { recursive: true });

let written = 0;
for (const entry of data) {
  const file = path.join(outDir, `${String(entry.day).padStart(3, '0')}.md`);
  if (existsSync(file) && !force) {
    throw new Error(`${file} already exists; pass --force to overwrite hand-edited files.`);
  }

  const images = Array.isArray(entry.images) ? entry.images : [];
  const lines = [
    '---',
    `day: ${entry.day}`,
    `name: ${yaml(entry.name.trim())}`,
    `date: ${isoDate(entry.date)}`,
    `lat: ${entry.lat}`,
    `long: ${entry.long}`,
    `mileage: ${entry.mileage}`,
  ];
  if (entry.altitude !== undefined && entry.altitude !== null) lines.push(`altitude: ${entry.altitude}`);
  // Alt text is written by hand afterwards; the schema rejects an empty alt so none get missed.
  lines.push(
    images.length
      ? `images:\n${images.map((img) => `  - src: ${yaml(img)}\n    alt: ""`).join('\n')}`
      : 'images: []',
  );
  if (entry.blog_entry !== undefined) lines.push(`blog_entry: ${entry.blog_entry}`);
  lines.push('---', '');

  const body = String(entry.text ?? '').trim();
  await writeFile(file, `${lines.join('\n')}${body ? `\n${body}\n` : ''}`);
  written += 1;
}

console.log(`Wrote ${written} files to ${outDir}`);
