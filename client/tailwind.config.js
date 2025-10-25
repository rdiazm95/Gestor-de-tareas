/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',  // ← Esto debe estar presente
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
