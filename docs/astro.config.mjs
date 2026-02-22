// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://yoanbernabeu.github.io',
  base: '/oopsie',
  integrations: [tailwind()],
});
