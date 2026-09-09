import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://nicolasruntz.com',
  output: 'static',
  integrations: [
    mdx(),
    // The AP automation landing page is a single hydrated Preact island: its
    // personalisation rewrites surfaces in the header, hero, features, FAQ and
    // side panel from one piece of state, so splitting it would mean sharing
    // state across islands. Astro still prerenders it to complete static HTML.
    preact(),
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
