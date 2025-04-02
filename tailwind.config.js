/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        'x-dark': '#000000',
        'x-gray': '#2f3336',
        'x-text': '#e7e9ea',
        'x-text-muted': '#71767b',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
} 