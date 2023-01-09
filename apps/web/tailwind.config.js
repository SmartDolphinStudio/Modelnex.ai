/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./apps/web/index.html",
    "./apps/web/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7f5445',
        secondary: '#76574d',
        tertiary: '#715950',
        background: '#fff8f3',
        surface: '#fff8f3',
        'on-surface': '#1f1b14',
        'on-surface-variant': '#514440',
        'surface-container': '#f6ece1',
        'surface-container-low': '#fcf2e7',
        'surface-container-high': '#f1e7dc',
        'surface-container-highest': '#ebe1d6',
        'primary-container': '#d9a391',
        'secondary-container': '#ffd7ca',
        'outline-variant': '#d5c2bd',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Newsreader', 'serif'],
      },
    },
  },
  plugins: [],
}
