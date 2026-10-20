/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#F7F6F2',
        ink: '#191919',
        mute: '#77756F',
        line: '#E8E5DE',
        accent: {
          DEFAULT: '#F28C45',
          hover: '#E07B34',
          soft: 'rgba(242, 140, 69, 0.14)',
        },
        shell: '#171717',
        panel: '#222222',
        raised: '#1C1C1C',
        hairline: '#2C2C2C',
        success: '#3FA36C',
        warn: '#D39B3A',
        danger: '#C45C4A',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0,0,0,0.18)',
        card: '0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.22)',
      },
    },
  },
  plugins: [],
};
