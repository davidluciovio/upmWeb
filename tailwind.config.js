/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'symbol': ['Material Symbols Outlined'],
      },
    },
  },
  plugins: [],
};
