import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './features/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF3EC',
        warmWhite: '#FFF9F5',
        blush: '#F3D9DD',
        rose: '#E3AEB8',
        roseDeep: '#C97F8C',
        roseGold: '#C99383',
        gold: '#D9B88A',
        goldSoft: '#E9CFA3',
        deep: '#241A1E',
        deep2: '#2E2024',
        ink: '#4A3B3F',
        inkSoft: '#7A6367',
        sea1: '#8FB3B0',
        sea2: '#5E8A8C',
        sunset1: '#F2B892',
        sunset2: '#E8917E',
      },
      fontFamily: {
        arDisplay: ['var(--font-ar-display)', 'serif'],
        arBody: ['var(--font-ar-body)', 'sans-serif'],
        enDisplay: ['var(--font-en-display)', 'serif'],
        enBody: ['var(--font-en-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
