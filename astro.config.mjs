import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  site: 'https://singingandpicking.netlify.app',
  devToolbar: { enabled: false },
});
