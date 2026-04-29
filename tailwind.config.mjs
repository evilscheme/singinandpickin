/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        paper: '#f6f1e7',
        'paper-light': '#fbf6ec',
        ink: '#1a1612',
        'ink-soft': '#3a3228',
        muted: '#5a4f3f',
        accent: '#a8442a',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        'art-stripes':
          'repeating-linear-gradient(135deg, #e8dcc4 0 14px, #e0d2b6 14px 28px)',
        'art-stripes-mobile':
          'repeating-linear-gradient(135deg, #e8dcc4 0 12px, #e0d2b6 12px 24px)',
      },
    },
  },
  plugins: [],
};
