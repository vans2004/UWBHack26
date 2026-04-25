/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream:   { DEFAULT: '#FFF8EE', dark: '#F5EDD8' },
        sage:    { light: '#D4F0E0', DEFAULT: '#A8D8B9', dark: '#72B896' },
        lavender:{ light: '#EDE8FB', DEFAULT: '#C4B5E8', dark: '#9B87D4' },
        peach:   { light: '#FFEEE6', DEFAULT: '#FFB997', dark: '#FF8C5A' },
        lemon:   { light: '#FFF8D6', DEFAULT: '#FFE0A3', dark: '#F4C256' },
        rose:    { light: '#FFE8F0', DEFAULT: '#FFB3CE', dark: '#FF7BAC' },
        ink:     { DEFAULT: '#3D3250', muted: '#8E80B0', faint: '#C5BDD8' },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft:   '0 4px 24px rgba(100,80,160,0.08)',
        softer: '0 2px 12px rgba(100,80,160,0.06)',
        pop:    '0 8px 32px rgba(100,80,160,0.14)',
      },
      animation: {
        'float':   'float 3s ease-in-out infinite',
        'wiggle':  'wiggle 0.35s ease-in-out infinite',
        'sway':    'sway 2.8s ease-in-out infinite',
        'shiver':  'shiver 0.2s ease-in-out infinite',
        'pop-in':  'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
      },
      keyframes: {
        float:  { '0%,100%': { transform: 'translateY(0)'    }, '50%': { transform: 'translateY(-12px)' } },
        wiggle: { '0%,100%': { transform: 'rotate(-4deg)'    }, '50%': { transform: 'rotate(4deg)'      } },
        sway:   { '0%,100%': { transform: 'rotate(-3deg) translateY(0)'  }, '50%': { transform: 'rotate(3deg) translateY(-6px)' } },
        shiver: { '0%,100%': { transform: 'translateX(-3px)' }, '50%': { transform: 'translateX(3px)'   } },
        popIn:  { '0%': { transform: 'scale(0)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
      },
    },
  },
  plugins: [],
}
