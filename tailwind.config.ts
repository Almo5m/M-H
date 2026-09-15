import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './features/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F7F1E8',
        warmWhite: '#FFFBF6',
        mauve: '#8E6873',
        mauveSoft: '#B99AA1',
        gold: '#C7A96B',
        ink: '#40383A',
        inkSoft: '#8B8182',
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
