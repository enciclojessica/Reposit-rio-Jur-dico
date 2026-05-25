/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#0b0f1a',
        surface: '#111827',
        raised:  '#1a2236',
        border:  '#1e2d45',
        gold:    '#c9a452',
        cream:   '#e8dfc8',
        muted:   '#6b7fa3',
      },
      fontFamily: {
        mono:   ['"IBM Plex Mono"', 'monospace'],
        serif:  ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
}
