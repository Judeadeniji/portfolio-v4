// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

import mdx from '@astrojs/mdx';

import { satteri } from '@astrojs/markdown-satteri';
import { satteriReadingTime } from './src/plugins/satteri-reading-time.js';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://oferanmi.netlify.app/',
  markdown: {
    processor: satteri({ 
      features: { smartPunctuation: true },
      mdastPlugins: [satteriReadingTime]
    }),
  },
  server: {
      port: Number.parseInt(process.env.PORT ?? '4321'),
  },

  vite: {
    plugins: [tailwindcss()],
    oxc: {
      jsx: {
        runtime: "automatic"
      }
    }
  },

  image: {
    domains: ['avatars.githubusercontent.com', 'cdn.simpleicons.org'],
  },

  integrations: [react(), mdx(), sitemap()]
});