// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

import mdx from '@astrojs/mdx';

import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import { unified } from '@astrojs/markdown-remark';

// https://astro.build/config
export default defineConfig({
  markdown: {
    processor: unified({
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['!no-underline', 'hover:text-muted-foreground', 'transition-colors'] } }]
      ],
    }),
  },
  server: {
      port: Number.parseInt(process.env.PORT ?? '4321'),
  },

  vite: {
    plugins: [tailwindcss()],
    esbuild: {
      jsx: 'automatic'
    }
  },

  image: {
    domains: ['avatars.githubusercontent.com', 'cdn.simpleicons.org'],
  },

  integrations: [react(), mdx()]
});