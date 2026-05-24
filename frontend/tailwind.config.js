/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0F172A',
          card: 'rgba(30, 41, 59, 0.7)', // Glassmorphism base
          accent: '#38BDF8',
        },
        primary: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
        },
        secondary: '#EC4899',
        accent: '#10B981',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
