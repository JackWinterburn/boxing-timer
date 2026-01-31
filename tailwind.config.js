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
          primary: '#54f085',
          bg: '#0d1410',
          card: '#161e19',
          border: '#1f2923',
          text: {
            muted: '#7d8a82',
            dim: '#4a5750'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      dropShadow: {
        'glow': '0 0 15px rgba(84, 240, 133, 0.4)',
        'glow-strong': '0 0 25px rgba(84, 240, 133, 0.6)',
      }
    },
  },
  plugins: [],
}
