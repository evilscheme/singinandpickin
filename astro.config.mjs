import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://singingandpicking.netlify.app',
  devToolbar: { enabled: false },
  markdown: {
    // Song bodies use ```chordpro fences (parsed by ChordChart); Shiki has no such grammar
    shikiConfig: { langAlias: { chordpro: 'plaintext' } },
  },
});
