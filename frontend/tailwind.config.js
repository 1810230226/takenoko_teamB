/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",        // CRA は不要の場合もあり
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
