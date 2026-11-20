import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
      },
      boxShadow: {
        "glow-sm": "0 0 12px -2px rgba(56, 189, 248, 0.25)",
        glow: "0 0 20px -3px rgba(56, 189, 248, 0.35)",
        "card-hover":
          "0 12px 24px -10px rgba(0, 0, 0, 0.6), 0 0 15px -3px rgba(56, 189, 248, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
