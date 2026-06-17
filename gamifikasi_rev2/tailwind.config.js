/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dde6ff',
          200: '#c3d0ff',
          300: '#9fb1ff',
          400: '#7a87fc',
          500: '#5b63f8',
          600: '#4540ed',
          700: '#3b32d3',
          800: '#302bab',
          900: '#2c2887',
        },
      },
    },
  },
  plugins: [],
};
