import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Generic "pages" collection: standalone content pages authored in
// Markdown/MDX and rendered through a dedicated route. Only one entry
// exists today (ap-automation-software), but the collection is in place
// so new pages can be added as plain content files, without touching
// the routing/rendering code.
const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Search engines should not index/follow this page yet.
    noindex: z.boolean().default(false),
  }),
});

export const collections = {
  pages,
};
