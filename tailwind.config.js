/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        white: 'var(--white)',
        black: 'var(--black)',
        primary: {
          DEFAULT: 'var(--primary)',
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          300: 'var(--primary-300)',
          600: 'var(--primary-600)',
          950: 'var(--primary-950)',
          hover: 'var(--primary-hover)',
        },
        'light-blue': 'var(--light-blue)',
        text: 'var(--text)',
        bg: 'var(--bg)',
        btn: 'var(--btn)',
        gray: {
          50: 'var(--gray50)',
          200: 'var(--gray200)',
          300: 'var(--gray300)',
          400: 'var(--gray400)',
          500: 'var(--gray500)',
          600: 'var(--gray600)',
          800: 'var(--gray800)',
        },
        'bg-card': 'var(--bg-card)',
        'bg-gray': 'var(--bg-gray)',
        border: 'var(--border)',
        error: 'var(--error)',
        telegram: 'var(--telegram)',
        youtube: 'var(--youtube)',
        whatsapp: 'var(--whatsapp)',
      },
      boxShadow: {
        custom: 'var(--box-shadow)',
      },
      fontFamily: {
        regular: 'var(--regular)',
        medium: 'var(--medium)',
        bold: 'var(--cerabold)',
      },
    },
  },
  plugins: [],
}
