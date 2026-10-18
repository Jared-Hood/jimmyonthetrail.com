import type { APIRoute } from 'astro';
import { getPosts } from '../lib/blog';
export const GET: APIRoute = async ({ site }) => {
  const paths = [
    '',
    'blog/',
    'map/',
    'gallery/',
    'gear/',
    'wishes/',
    ...(await getPosts()).map((post) => `blog/${post.data.day}/`),
  ];
  const urls = paths
    .map((path) => `<url><loc>${new URL(path, site).href}</loc></url>`)
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
