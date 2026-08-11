// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://motorsport-platform.com',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [svelte(), sitemap()],

  vite: {
    plugins: [tailwindcss()]
  }
});