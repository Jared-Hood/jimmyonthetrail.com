#!/usr/bin/env node
/**
 * One-off export of the old "Well Wishes" guestbook from Firestore.
 *
 * Reads the public `comments` collection of the jimmy-on-the-trail-7ebae project
 * through the Firestore REST API and writes src/data/wishes.json, which /wishes renders
 * at build time.
 *
 *   FIREBASE_WEB_API_KEY=... node scripts/export-wishes.mjs
 *
 * The key is the public "apiKey" from the old site's Firebase web config; it is read from the
 * environment so it doesn't live in this repository.
 */
import { writeFile } from 'node:fs/promises';

const PROJECT_ID = 'jimmy-on-the-trail-7ebae';
const API_KEY = process.env.FIREBASE_WEB_API_KEY;
if (!API_KEY) {
  console.error('Set FIREBASE_WEB_API_KEY (the apiKey from the old Firebase web config).');
  process.exit(1);
}
const OUTPUT = new URL('../src/data/wishes.json', import.meta.url);

const base = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/comments`;

/** Flattens a Firestore REST value ({ stringValue: "x" }, { timestampValue: "..." }, ...). */
function plain(value) {
  if (!value) return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  return undefined;
}

async function fetchAll() {
  const documents = [];
  let pageToken;
  do {
    const url = new URL(base);
    url.searchParams.set('pageSize', '300');
    url.searchParams.set('key', API_KEY);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Firestore responded ${response.status}: ${await response.text()}`);
    }
    const body = await response.json();
    documents.push(...(body.documents ?? []));
    pageToken = body.nextPageToken;
  } while (pageToken);
  return documents;
}

const documents = await fetchAll();

const wishes = documents
  .map((doc) => {
    const fields = doc.fields ?? {};
    const timestamp = plain(fields.timestamp) ?? plain(fields.createdAt) ?? plain(fields.date);
    return {
      id: doc.name.split('/').pop(),
      name: String(plain(fields.name) ?? '').trim(),
      message: String(plain(fields.message) ?? '').trim(),
      // The old form never stored a timestamp, so fall back to the document's creation time.
      createdAt: timestamp ?? doc.createTime,
    };
  })
  .filter((wish) => wish.name || wish.message)
  .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

await writeFile(OUTPUT, `${JSON.stringify(wishes, null, 2)}\n`);
console.log(`Exported ${wishes.length} wishes (of ${documents.length} documents) to src/data/wishes.json`);
