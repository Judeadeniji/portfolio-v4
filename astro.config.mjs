// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
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