import sharp from 'sharp';
import { readdir, mkdir, stat, rm } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('public/images');
async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'optimized') continue;
    const source = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(source)));
    else if (/\.(jpg|jpeg|png)$/i.test(entry.name)) files.push(source);
  }
  return files;
}
const files = await walk(root);
for (const file of files) {
  const relative = path.relative(root, file).replace(/\.[^.]+$/, '');
  const widths = relative.startsWith(`gallery${path.sep}`)
    ? [480]
    : relative === path.join('site', 'skyline')
      ? [480, 960, 1800]
      : [480, 960];
  // Only retain sizes used by the site. Full-size downloads use the originals.
  for (const width of [480, 960, 1800].filter(
    (size) => !widths.includes(size),
  )) {
    await rm(path.join(root, 'optimized', `${relative}-${width}.webp`), {
      force: true,
    });
  }
  for (const width of widths) {
    const target = path.join(root, 'optimized', `${relative}-${width}.webp`);
    try {
      if ((await stat(target)).mtimeMs >= (await stat(file)).mtimeMs) continue;
    } catch {}
    await mkdir(path.dirname(target), { recursive: true });
    await sharp(file)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(target);
  }
}
console.log(
  `Prepared responsive WebP copies of ${files.length} original images.`,
);
