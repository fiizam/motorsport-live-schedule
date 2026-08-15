// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

import vercel from '@astrojs/vercel';

import AstroPWA from '@vite-pwa/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://motorsport-platform.com',
  output: 'server',
  adapter: vercel(),
  integrations: [
    svelte(),
    sitemap(),
    AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      manifest: {
        name: 'Motorsport Live Schedule',
        short_name: 'Motorsport',
        description: 'Real-Time Formula 1 & MotoGP Schedule Platform',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: '/404',
        globPatterns: ['**/*.{css,js,html,svg,png,ico,txt}']
      },
      devOptions: {
        enabled: true,
        navigateFallbackAllowlist: [/^\/404$/]
      }
    })
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});