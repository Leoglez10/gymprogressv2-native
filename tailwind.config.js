/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#FFEF0A',
        background: '#0f0f0f',
        surface: '#1a1a1a',
        'surface-light': '#2a2a2a',
      },
      fontFamily: {
        // iOS Native Font - SF Pro (San Francisco)
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        'sf-pro': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text'],
        'sf-pro-display': ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont'],
        'sf-pro-text': ['SF Pro Text', '-apple-system', 'BlinkMacSystemFont'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      // iOS Native Shadows
      boxShadow: {
        'ios-sm': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'ios': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'ios-lg': '0 8px 24px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
};
