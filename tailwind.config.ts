import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "hm-red": "#E50010",
        "hm-dark": "#1A1A1A",
        "hm-gray": "#767676",
        "hm-light": "#F5F5F5",
        "hm-border": "#DDDDDD",
        "hm-white": "#FFFFFF",
        "hm-sale": "#E50010",
        "hm-gold": "#C8A96E",
      },
      fontFamily: {
        sans: ["'Barlow'", "system-ui", "sans-serif"],
        barlow: ["'Barlow'", "system-ui", "sans-serif"],
        condensed: ["'Barlow Condensed'", "sans-serif"],
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
      },
      screens: {
        xs: "475px",
      },
    },
  },
  plugins: [],
};

export default config;
