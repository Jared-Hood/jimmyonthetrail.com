import type { APIRoute } from 'astro';
import { getPosts, excerpt } from '../lib/blog';
const escape = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (char) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[char]!,
  );
export const GET: APIRoute = async ({ site }) => {
  const posts = (await getPosts()).reverse();
  const base = site ?? new URL('https://jimmyonthetrail.com');
  const items = posts
    .map((post) => {
      const link = new URL(`/blog/${post.data.day}/`, base).href;
      return `<item><title>${escape(`Day ${post.data.day}: ${post.data.title}`)}</title><link>${link}</link><guid>${link}</guid><pubDate>${new Date(`${post.data.date}T12:00:00Z`).toUTCString()}</pubDate><description>${escape(excerpt(post, 500))}</description></item>`;
    })
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Jimmy on the Trail</title><link>${base}</link><description>RocketMan’s 2022 Appalachian Trail journal, from Georgia to Maine.</description><language>en-us</language>${items}</channel></rss>`,
    { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } },
  );
};
