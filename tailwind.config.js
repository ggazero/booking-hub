/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy': '#000b50',
        'cobalt': '#1d6ae5',
        'cobalt-light': '#5790eb',
        'gold': '#ffc729',
        'cream': '#f9f0e2',
        'ink': '#212121',
        'ink-muted': '#5c5c5c',
      },
      boxShadow: {
        'card-navy': '0 4px 12px rgba(0, 11, 80, 0.1)',
      },
      borderRadius: {
        'card': '16px',
        'button': '6px',
      },
    },
  },
  plugins: [],
}
