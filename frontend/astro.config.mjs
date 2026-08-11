// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://motorsport-platform.com',
  output: 'server',
  adapter: vercel(),
  integrations: [svelte(), sitemap()],

  vite: {
    plugins: [tailwindcss()]
  }
});