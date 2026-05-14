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
        background: "#0A0A0A",
        foreground: "#F5F5DC",
        ink: {
          DEFAULT: "#0A0A0A",
          50: "#FAFAFA",
          100: "#F5F5F5",
          800: "#1A1A1A",
          900: "#0A0A0A",
          950: "#050505",
        },
        gold: {
          DEFAULT: "#D4AF37",
          50: "#FBF6E2",
          100: "#F7ECC0",
          200: "#F0DD8A",
          300: "#E9CD5C",
          400: "#DFBE3E",
          500: "#D4AF37",
          600: "#B8952A",
          700: "#8E711F",
          800: "#5F4B14",
          900: "#3D300C",
        },
        cream: "#F5F5DC",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #D4AF37 0%, #F4D03F 50%, #D4AF37 100%)",
        "gold-radial": "radial-gradient(ellipse at center, rgba(212,175,55,0.18) 0%, rgba(10,10,10,0) 70%)",
      },
      boxShadow: {
        gold: "0 4px 20px -4px rgba(212, 175, 55, 0.35)",
        "gold-lg": "0 10px 40px -8px rgba(212, 175, 55, 0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
