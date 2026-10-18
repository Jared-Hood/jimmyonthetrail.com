import { readFile, writeFile } from 'node:fs/promises';

const source = process.argv[2];
if (!source)
  throw new Error(
    'Usage: npm run import:wishes -- /absolute/path/to/comments.json',
  );
const input = JSON.parse(await readFile(source, 'utf8'));
const rows = Array.isArray(input) ? input : (input.documents ?? input.comments);
if (!Array.isArray(rows))
  throw new Error(
    'Expected an array of { name, message }, a comments array, or a Firestore REST documents export.',
  );
const messages = rows.map((row, index) => {
  const name =
    row.name?.stringValue ??
    row.fields?.name?.stringValue ??
    (row.fields ? undefined : row.name);
  const message =
    row.message?.stringValue ?? row.fields?.message?.stringValue ?? row.message;
  if (
    typeof name !== 'string' ||
    typeof message !== 'string' ||
    !name.trim() ||
    !message.trim()
  )
    throw new Error(`Message ${index + 1} must contain a name and message.`);
  return { name, message };
});
await writeFile(
  new URL('../src/data/wishes.json', import.meta.url),
  `${JSON.stringify(messages, null, 2)}\n`,
);
console.log(
  `Saved ${messages.length} well wishes locally. Rebuild the site to publish the archive.`,
);
