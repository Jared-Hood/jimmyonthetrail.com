import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    day: z.number().int(),
    date: z.string(),
    mileage: z.number(),
    latitude: z.number(),
    longitude: z.number(),
    altitude: z.number().optional(),
    images: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
