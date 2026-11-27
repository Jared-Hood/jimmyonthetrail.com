import type { ImageMetadata } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

export type Day = CollectionEntry<'days'>;

/** Total length of the Appalachian Trail in 2022, as used on the old site. */
export const TRAIL_TOTAL_MILES = 2194.3;

const dayImages = import.meta.glob<ImageMetadata>('/src/assets/days/**/*.{jpg,jpeg,png,JPG}', {
  eager: true,
  import: 'default',
});

/** Resolves an image path from a day's frontmatter (e.g. "3-20/1.jpg") to an imported image. */
export function resolveDayImage(path: string): ImageMetadata {
  const image = dayImages[`/src/assets/days/${path}`];
  if (!image) throw new Error(`Missing day image: src/assets/days/${path}`);
  return image;
}

/** All days (including day 0, the approach trail) sorted by day number. */
export async function getDays(): Promise<Day[]> {
  const days = await getCollection('days');
  return days.sort((a, b) => a.data.day - b.data.day);
}

export function totalMiles(days: Day[]): number {
  return days.reduce((sum, day) => sum + day.data.mileage, 0);
}

const dateFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});
const shortDateFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  month: 'short',
  day: 'numeric',
});

export const formatDate = (date: Date) => dateFormat.format(date);
export const formatShortDate = (date: Date) => shortDateFormat.format(date);
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export const formatMiles = (miles: number) =>
  miles.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
