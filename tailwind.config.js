/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan all React component files
  ],
  theme: {
    extend: {
      colors: {
        // We'll use 'indigo' as our primary theme color
        primary: colors.indigo,
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}