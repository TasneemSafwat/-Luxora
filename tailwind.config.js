/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
    extend: {
      spacing: {
        4.5: '1.125rem',
        13: '3.25rem',
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      colors: {
        /* Brand primary — deep editorial charcoal */
        ink: {
          DEFAULT: '#171717',
          50: '#F7F7F7',
          100: '#EDEDED',
          200: '#D9D9D9',
          300: '#BFBFBF',
          400: '#8C8C8C',
          500: '#595959',
          600: '#3D3D3D',
          700: '#2B2B2B',
          800: '#1F1F1F',
          900: '#171717',
          950: '#0D0D0D',
        },
        /* Brand secondary — warm paper */
        cream: {
          DEFAULT: '#F5F2ED',
          soft: '#FAF8F4',
          deep: '#EDE8E0',
        },
        /* Accent — muted luxury gold */
        gold: {
          DEFAULT: '#B89B72',
          50: '#FBF9F5',
          100: '#F3ECDF',
          200: '#E6D7BC',
          300: '#D6C09A',
          400: '#C6AC84',
          500: '#B89B72',
          600: '#9C8058',
          700: '#7D6545',
          800: '#5E4C33',
          900: '#3F3322',
        },
        /* Neutrals */
        ash: '#242424',
        muted: '#888888',
        line: '#E7E4DF',
        /* Dark surface system */
        night: {
          DEFAULT: '#0E0E0E',
          soft: '#141414',
          card: '#1A1A1A',
          border: '#262626',
        },
        danger: '#B4443B',
        success: '#3F7A5A',
        warning: '#B98A3B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        arabic: ['Cairo', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        display: ['clamp(2.75rem, 7vw, 5.75rem)', { lineHeight: '0.98', letterSpacing: '-0.02em' }],
        headline: ['clamp(2rem, 4.2vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.015em' }],
        title: ['clamp(1.5rem, 2.4vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      letterSpacing: {
        eyebrow: '0.22em',
        wide: '0.08em',
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '6px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(23, 23, 23, 0.04), 0 12px 32px -18px rgba(23, 23, 23, 0.28)',
        lift: '0 24px 60px -32px rgba(23, 23, 23, 0.45)',
        ring: '0 0 0 1px rgba(23, 23, 23, 0.08)',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        400: '400ms',
        600: '600ms',
        900: '900ms',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.5s ease both',
        marquee: 'marquee 32s linear infinite',
        shimmer: 'shimmer 1.6s infinite',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
