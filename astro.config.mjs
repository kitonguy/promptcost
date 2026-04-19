import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

export default defineConfig({
  output: 'hybrid',
  site: 'https://promptcost.org',
  compressHTML: true,
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  integrations: [
    tailwind({
      applyBaseStyles: false
    }),
    mdx()
  ],
  vite: {
    build: {
      assetsInlineLimit: 0,
      cssMinify: true,
      minify: true
    }
  }
});