/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        boxing: {
          green: '#4ade80',
          dark: '#0a0a0a',
          card: '#1a1a1a',
        }
      },
      boxShadow: {
        'neon': '0 0 15px rgba(74, 222, 128, 0.5)',
        'neon-strong': '0 0 25px rgba(74, 222, 128, 0.7)',
      }
    },
  },
  plugins: [],
}
