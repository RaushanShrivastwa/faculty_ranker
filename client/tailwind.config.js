/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#1E1E2D',
          light: '#2D2D42',
        },
        accent: {
          purple: '#8B5CF6',
        },
        gray: {
          100: '#F3F4F6',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
