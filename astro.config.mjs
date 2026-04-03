// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['isomorphic-dompurify', 'jsdom', 'html-encoding-sniffer', '@exodus/bytes']
    }
  },

  integrations: [react()],

  adapter: vercel({
    webAnalytics: { enabled: true }
  })
});