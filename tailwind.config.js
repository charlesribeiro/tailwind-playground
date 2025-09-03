/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,vue,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      backdropBlur: {
        xl: '12px',
      },
    },
  },
  plugins: [
    require('./tailwind-plugins/backdrop-blur.js'),
  ],
};
