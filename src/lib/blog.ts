import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;
export const getPosts = async () =>
  (await getCollection('blog')).sort((a, b) => a.data.day - b.data.day);
export const postUrl = (post: Post) => `/blog/${post.data.day}/`;
export const formatDate = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
export const excerpt = (post: Post, length = 150) => {
  const body = (post.body ?? '').trim().replace(/\s+/g, ' ');
  if (!body) return '';
  return body.length > length
    ? `${body.slice(0, length).replace(/\s+\S*$/, '')}…`
    : body;
};
export const cover = (post: Post) =>
  post.data.images[0] ||
  (post.data.day === 157
    ? '/images/site/Summit.jpg'
    : '/images/site/skyline.jpeg');
export const optimized = (src: string, width = 960) =>
  `/images/optimized/${src.replace(/^\/images\//, '').replace(/\.[^.]+$/, '')}-${width}.webp`;
