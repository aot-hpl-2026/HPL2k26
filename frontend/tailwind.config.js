/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mahabharat-inspired color palette
        'hpl-maroon': '#8B1538',
        'hpl-crimson': '#DC143C',
        'hpl-gold': '#D4AF37',
        'hpl-bronze': '#CD7F32',
        'hpl-navy': '#1B1F3B',
        'hpl-midnight': '#191970',
        'hpl-parchment': '#F5F0E6',
        'hpl-beige': '#F5DEB3',
        'hpl-stone': '#708090',
        'hpl-dark': '#1a1a2e',
      },
      fontFamily: {
        'epic': ['Cinzel', 'serif'],
        'body': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern': "url('/images/hero-bg.jpg')",
        'gradient-epic': 'linear-gradient(135deg, #8B1538 0%, #D4AF37 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1B1F3B 0%, #191970 100%)',
      },
      boxShadow: {
        'epic': '0 10px 40px rgba(139, 21, 56, 0.3)',
        'gold': '0 10px 40px rgba(212, 175, 55, 0.3)',
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        hpl: {
          "primary": "#8B1538",
          "primary-content": "#ffffff",
          "secondary": "#D4AF37",
          "secondary-content": "#1a1a2e",
          "accent": "#1B1F3B",
          "accent-content": "#ffffff",
          "neutral": "#708090",
          "neutral-content": "#ffffff",
          "base-100": "#F5F0E6",
          "base-200": "#EDE5D8",
          "base-300": "#DDD5C8",
          "base-content": "#1a1a2e",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
        hpldark: {
          "primary": "#DC143C",
          "primary-content": "#ffffff",
          "secondary": "#D4AF37",
          "secondary-content": "#1a1a2e",
          "accent": "#F5DEB3",
          "accent-content": "#1a1a2e",
          "neutral": "#708090",
          "neutral-content": "#ffffff",
          "base-100": "#1a1a2e",
          "base-200": "#16213e",
          "base-300": "#0f3460",
          "base-content": "#F5F0E6",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
    ],
  },
}
