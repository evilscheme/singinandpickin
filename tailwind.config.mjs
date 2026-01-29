/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(217, 119, 6, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(217, 119, 6, 0.5)' },
        },
      },
      boxShadow: {
        'glow-amber': '0 0 20px rgba(217, 119, 6, 0.3)',
        'glow-amber-lg': '0 0 40px rgba(217, 119, 6, 0.5)',
      },
      colors: {
        // Warm amber/honey tones
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Earthy neutrals
        earth: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#e8dfd2',
          300: '#d4c4ac',
          400: '#bea583',
          500: '#a68a5b',
          600: '#8b7049',
          700: '#6f5a3c',
          800: '#5c4a33',
          900: '#4d3e2c',
          950: '#2a2118',
        },
        // Sage green accents
        sage: {
          50: '#f6f7f4',
          100: '#e3e7dd',
          200: '#c7d0ba',
          300: '#a4b38f',
          400: '#829569',
          500: '#657a4c',
          600: '#4e6039',
          700: '#3e4b2f',
          800: '#343e29',
          900: '#2d3524',
          950: '#171c12',
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        'wood-texture': "url('/textures/wood-grain.svg')",
      },
    },
  },
  plugins: [],
};
