/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#111118',
        border: '#1e1e2e',
        primary: '#00ff88',
        secondary: '#ff6b35',
        text: '#f0f0ff',
        muted: '#6b6b8a'
      },
      boxShadow: {
        glow: '0 0 18px rgba(0, 255, 136, 0.35)',
        pulse: '0 0 26px rgba(255, 107, 53, 0.28)'
      }
    }
  },
  plugins: []
};
