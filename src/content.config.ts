import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per trail day (000.md … 157.md), converted from the old site's
// blog_data.json by scripts/json-to-markdown.mjs. The body is Jimmy's journal text.
const days = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/days' }),
  schema: z.object({
    day: z.number().int().nonnegative(),
    name: z.string().trim(),
    date: z.coerce.date(),
    lat: z.number(),
    long: z.number(),
    mileage: z.number(),
    altitude: z.number().optional(),
    // Photo paths are relative to src/assets/days; alt text was written by looking at each photo.
    images: z.array(z.object({ src: z.string(), alt: z.string().min(1) })).default([]),
    blog_entry: z.boolean().optional(),
  }),
});

export const collections = { days };
