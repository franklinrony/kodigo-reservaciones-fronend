/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        kodigo: {
          primary: '#6B46C1',    // Morado principal
          secondary: '#EC4899',   // Rosa/Magenta
          accent: '#F97316',      // Naranja
          dark: '#4C1D95',        // Morado oscuro
          light: '#DDD6FE',       // Morado claro
        },
        primary: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        secondary: {
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
          700: '#BE185D',
          800: '#9D174D',
          900: '#831843',
        },
        accent: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        }
      },
      backgroundImage: {
        'kodigo-gradient': 'linear-gradient(135deg, #6B46C1 0%, #EC4899 50%, #F97316 100%)',
        'kodigo-gradient-reverse': 'linear-gradient(315deg, #6B46C1 0%, #EC4899 50%, #F97316 100%)',
        'kodigo-gradient-vertical': 'linear-gradient(180deg, #6B46C1 0%, #EC4899 50%, #F97316 100%)',
      }
    },
  },
  plugins: [
    // Forms plugin provides better defaults for inputs, selects, textareas and radios/checkboxes
    require('@tailwindcss/forms'),
  ],
};
