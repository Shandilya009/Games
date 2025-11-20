/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0e27',
        'bg-secondary': '#141b2d',
        'bg-card': '#1a2332',
        'bg-hover': '#252f42',
        'accent-primary': '#00d4ff',
        'accent-secondary': '#7b2cbf',
        'accent-tertiary': '#ff006e',
        'text-primary': '#ffffff',
        'text-secondary': '#a0aec0',
        'text-muted': '#718096',
        'border-color': '#2d3748',
      },
      animation: {
        'fadeInUp': 'fadeInUp 0.6s ease-out',
        'slideInRight': 'slideInRight 0.3s ease-out',
        'fadeIn': 'fadeIn 0.3s ease',
        'shake': 'shake 0.5s',
      },
      keyframes: {
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          'from': { transform: 'translateX(400px)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-10px)' },
          '75%': { transform: 'translateX(10px)' },
        },
      },
    },
  },
  plugins: [],
}
