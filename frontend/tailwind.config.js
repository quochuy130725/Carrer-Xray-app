/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-secondary": "#ffffff",
        "on-primary": "#ffffff",
        "on-error": "#ffffff",
        "tertiary-fixed": "#ffdada",
        "on-primary-container": "#dad7ff",
        "tertiary-fixed-dim": "#ffb3b6",
        "on-background": "#171c1f",
        "on-surface": "#171c1f",
        "secondary": "#565e74",
        "secondary-fixed-dim": "#bec6e0",
        "outline": "#777587",
        "surface-container-low": "#f0f4f8",
        "error-container": "#ffdad6",
        "tertiary": "#950029",
        "surface-container-high": "#e4e9ed",
        "on-secondary-fixed-variant": "#3f465c",
        "on-tertiary-container": "#ffd0d2",
        "surface-container-highest": "#dfe3e7",
        "on-primary-fixed": "#0f0069",
        "on-tertiary-fixed": "#40000c",
        "on-tertiary": "#ffffff",
        "inverse-on-surface": "#edf1f5",
        "background": "#f6fafe",
        "primary-fixed": "#e2dfff",
        "surface-tint": "#4d44e3",
        "on-tertiary-fixed-variant": "#920028",
        "primary": "#3525cd",
        "on-surface-variant": "#464555",
        "primary-fixed-dim": "#c3c0ff",
        "surface-container-lowest": "#ffffff",
        "inverse-primary": "#c3c0ff",
        "surface-dim": "#d6dade",
        "on-secondary-container": "#5c647a",
        "on-primary-fixed-variant": "#3323cc",
        "outline-variant": "#c7c4d8",
        "secondary-fixed": "#dae2fd",
        "surface-variant": "#dfe3e7",
        "on-error-container": "#93000a",
        "surface-container": "#eaeef2",
        "surface-bright": "#f6fafe",
        "on-secondary-fixed": "#131b2e",
        "inverse-surface": "#2c3134",
        "tertiary-container": "#c20038",
        "secondary-container": "#dae2fd",
        "primary-container": "#4f46e5",
        "error": "#ba1a1a",
        "surface": "#f6fafe",
        "brandRed": '#ff2a55',
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "margin-mobile": "16px",
        "margin-desktop": "40px",
        "base": "8px",
        "gutter": "24px",
        "container-max": "1280px"
      },
      fontFamily: {
        "sans": ["'Plus Jakarta Sans'", "sans-serif"],
        "display": ["'Syne'", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "display-lg": ["Plus Jakarta Sans", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "headline-lg": ["Plus Jakarta Sans", "sans-serif"],
        "headline-md": ["Plus Jakarta Sans", "sans-serif"],
        "headline-lg-mobile": ["Plus Jakarta Sans", "sans-serif"]
      },
      fontSize: {
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "800" }],
        "label-sm": ["14px", { "lineHeight": "20px", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "700" }],
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "headline-lg-mobile": ["28px", { "lineHeight": "36px", "fontWeight": "700" }]
      },
      keyframes: {
        scanBeam: {
          '0%': { top: '0%', opacity: '0' },
          '15%': { opacity: '1' },
          '85%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' }
        },
        slideUpFade: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        }
      },
      animation: {
        'scan-beam': 'scanBeam 2.5s ease-in-out 1 forwards',
        'slideUpFade': 'slideUpFade 0.3s ease-out forwards',
        'float': 'float 3.5s ease-in-out infinite',
        'float-3d': 'float 4s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}
