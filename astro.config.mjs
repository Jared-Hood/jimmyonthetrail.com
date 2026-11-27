// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://jimmyonthetrail.com',
  // Emit /blog/5.html etc. so static hosts serve /blog/5 (no trailing slash) from that file.
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404') })],
  vite: {
    plugins: [tailwindcss()],
  },
});
