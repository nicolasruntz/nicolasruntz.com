import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://nicolasruntz.com',
  output: 'static',
  integrations: [
    mdx(),
    sitemap({
      // Keep the gated page out of the sitemap: it is marked noindex/nofollow
      // and is not meant to be discovered by search engines or crawlers.
      filter: (page) => !page.includes('/ap-automation-software/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
