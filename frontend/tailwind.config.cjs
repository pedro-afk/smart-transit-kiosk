/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        rail: {
          blue: '#1E3A5F',
          green: '#2F6F5E'
        }
      },
      fontFamily: {
        display: ['"Merriweather"', 'serif'],
        sans: ['"Manrope"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
