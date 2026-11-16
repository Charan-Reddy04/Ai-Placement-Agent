/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#009EAD',
          turquoise: '#00B8C7',
          cyan: '#38BDF8',
          navy: '#102A43',
          secondary: '#526B83',
        },
        surface: {
          light: '#FFFFFF',
          glass: 'rgba(255, 255, 255, 0.72)',
          dark: '#102A43',
          darkElevated: '#163750',
          darkGlass: 'rgba(16, 42, 67, 0.75)',
        },
        bgTone: {
          ice: '#EAF8FF',
          lavender: '#E9EDFF',
          paleCyan: '#DDF5FA',
          dark: '#071A2B',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          alert: '#F87171',
        }
      },
      borderRadius: {
        'card-sm': '16px',
        'card': '22px',
        'card-lg': '28px',
        'control': '12px',
        'control-lg': '16px',
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(0, 158, 173, 0.08), 0 4px 12px -2px rgba(16, 42, 67, 0.04)',
        'soft-hover': '0 18px 38px -5px rgba(0, 158, 173, 0.16), 0 8px 18px -2px rgba(16, 42, 67, 0.06)',
        'soft-dark': '0 10px 30px -5px rgba(0, 0, 0, 0.35)',
        'inset-soft': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.8), inset 0 -2px 4px 0 rgba(0, 158, 173, 0.05)',
        'glow-teal': '0 0 20px rgba(0, 184, 199, 0.35)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(100deg, #009EAD, #00B8C7, #38BDF8)',
        'gradient-page-light': 'linear-gradient(115deg, #EAF8FF, #E9EDFF, #DDF5FA)',
        'gradient-page-dark': 'linear-gradient(115deg, #071A2B, #0d2840, #071A2B)',
      }
    },
  },
  plugins: [],
};
