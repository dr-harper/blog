// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import { remarkReadingTime } from './src/utils/remarkReadingTime.ts';

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
  },
});
