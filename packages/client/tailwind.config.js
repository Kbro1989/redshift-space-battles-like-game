/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'rs-dark': '#080c14',
        'rs-panel': '#0d1b2e',
        'rs-border': '#1a3a5c',
        'rs-accent': '#00aaff',
        'rs-warn': '#ff6600',
        'rs-danger': '#cc0033',
        'rs-success': '#00cc66',
      },
      fontFamily: {
        hud: ['"Share Tech Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
