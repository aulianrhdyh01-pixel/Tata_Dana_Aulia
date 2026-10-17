/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: '#121215',
        'surface-elevated': '#18181b',
        'surface-border': '#27272a',
        tatadana: {
          lightBg: '#09090b',
          darkBg: '#09090b',
          card: '#121215',
          cardBorder: '#27272a',
          orange: '#f97316',
          orangeHover: '#ea580c',
          orangeLight: 'rgba(249, 115, 22, 0.1)',
          orangeGlow: 'rgba(249, 115, 22, 0.25)',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
