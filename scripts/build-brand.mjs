import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile } from 'node:fs/promises';

// Keep the rocket emoji as a local asset so every browser renders the same mark.
const emoji = await readFile(
  new URL('../public/brand/rocket-emoji.png', import.meta.url),
);
const createMark = (
  ridgeColor,
) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" width="512" height="512" role="img" aria-labelledby="title">
  <title id="title">RocketMan — rocket over mountains</title>
  <image x="128" y="16" width="300" height="300" xlink:href="data:image/png;base64,${emoji.toString('base64')}"/>
  <path d="m28 454 104-94 80 58 90-90 182 126" fill="none" stroke="${ridgeColor}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
</svg>\n`;
await writeFile(
  new URL('../public/brand/rocketman.svg', import.meta.url),
  createMark('#263d35'),
);
await writeFile(
  new URL('../public/brand/rocketman-light.svg', import.meta.url),
  createMark('#f8f5ef'),
);
const icon = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" width="512" height="512">
  <title>RocketMan</title>
  <rect width="512" height="512" fill="#f8f5ef"/>
  <image x="48" y="48" width="416" height="416" xlink:href="data:image/png;base64,${emoji.toString('base64')}"/>
</svg>\n`;
await writeFile(new URL('../public/favicon.svg', import.meta.url), icon);
const sizes = new Map([
  ['favicon-16x16.png', 16],
  ['favicon-32x32.png', 32],
  ['apple-touch-icon.png', 180],
  ['android-chrome-192x192.png', 192],
  ['android-chrome-512x512.png', 512],
  ['mstile-150x150.png', 150],
]);
for (const [name, size] of sizes) {
  await sharp(Buffer.from(icon))
    .resize(size, size)
    .png()
    .toFile(fileURLToPath(new URL(`../public/${name}`, import.meta.url)));
}
// PNG-backed ICO entries keep the legacy favicon in sync, too.
const bitmaps = await Promise.all(
  [16, 32, 48].map((size) =>
    sharp(Buffer.from(icon)).resize(size, size).png().toBuffer(),
  ),
);
const directory = Buffer.alloc(6 + bitmaps.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(bitmaps.length, 4);
let offset = directory.length;
bitmaps.forEach((bitmap, index) => {
  const start = 6 + index * 16;
  const size = [16, 32, 48][index];
  directory[start] = directory[start + 1] = size;
  directory.writeUInt16LE(1, start + 4);
  directory.writeUInt16LE(32, start + 6);
  directory.writeUInt32LE(bitmap.length, start + 8);
  directory.writeUInt32LE(offset, start + 12);
  offset += bitmap.length;
});
await writeFile(
  new URL('../public/favicon.ico', import.meta.url),
  Buffer.concat([directory, ...bitmaps]),
);
console.log('Updated the RocketMan logo and all favicon sizes.');
