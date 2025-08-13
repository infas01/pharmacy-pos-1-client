import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563eb', // blue-600
          fg: '#ffffff',
        },
        app: {
          bg: '#f8fafc', // slate-50
          card: '#ffffff',
          border: '#e5e7eb', // slate-200
          text: '#0f172a', // slate-900
          muted: '#6b7280', // gray-500/600
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.1)',
      },
      borderRadius: {
        xl: '0.75rem',
      },
    },
  },
  plugins: [forms],
};
