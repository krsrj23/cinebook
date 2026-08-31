/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        cinema: {
          50: '#f7f6f8',
          950: '#0b0a0c',
          900: '#131114',
          850: '#18151a',
          800: '#1f1b22',
          700: '#2a252d',
          600: '#3a3340',
          500: '#524a58',
          400: '#7a7080',
          300: '#a89fae',
          200: '#d4cdd8',
          100: '#efecf1',
        },
        gold: {
          50: '#fdf7e7',
          100: '#faecc0',
          200: '#f4d987',
          300: '#edc352',
          400: '#e8b34c',
          500: '#dba233',
          600: '#b98026',
          700: '#8f6220',
          800: '#6b4a1b',
          900: '#4a3315',
        },
        marquee: {
          red: '#c8352f',
          redDark: '#9c2a25',
        },
        seat: {
          available: '#2f8f5b',
          held: '#c9962f',
          booked: '#7a3238',
          selected: '#e8b34c',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(232,179,76,0.25), 0 8px 24px -8px rgba(232,179,76,0.35)',
        card: '0 4px 16px -4px rgba(0,0,0,0.5), 0 2px 6px -2px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(ellipse at top, rgba(232,179,76,0.08), transparent 60%)',
      },
    },
  },
  plugins: [],
}
