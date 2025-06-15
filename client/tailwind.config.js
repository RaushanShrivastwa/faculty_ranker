/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#1E1E2D',    // Dark background color
          light: '#2D2D42',   // Lighter dark variant
        },
        accent: {
          purple: '#8B5CF6',  // Purple accent color
        },
        gray: {
          100: '#F3F4F6',     // Light text color
          700: '#374151',     // Border colors
          800: '#1F2937',     // Darker elements
          900: '#111827',     // Darkest elements
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}