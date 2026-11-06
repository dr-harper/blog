// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import { remarkReadingTime } from './src/utils/remarkReadingTime.ts';
import { RELAYED } from './src/components/react/heatpump/relayed.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://mikeyharper.uk',
  trailingSlash: 'always',
  integrations: [
    expressiveCode({
      themes: ['github-dark', 'github-light'],
      themeCssSelector: (theme) => `[data-theme="${theme.name === 'github-dark' ? 'dark' : 'light'}"]`,
      defaultProps: {
        wrap: true,
      },
    }),
    mdx(),
    react(),
    sitemap(),
  ],
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [remarkReadingTime],
  },
  vite: {
    plugins: [tailwindcss()],
    // In development, relay the heat pump page's emoncms.org calls the way
    // netlify.toml does in production: the same calls and no others.
    server: {
      proxy: Object.fromEntries(
        RELAYED.map((call) => [
          `/api/emoncms/${call}`,
          { target: 'https://emoncms.org', changeOrigin: true, rewrite: (path) => path.replace(/^\/api\/emoncms/, '') },
        ]),
      ),
    },
  },
});
