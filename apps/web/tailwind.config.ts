import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        aoty: {
          green: "#22c55e",
          yellow: "#eab308",
          red: "#ef4444",
        },
      },
      boxShadow: {
        "card-light":
          "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
        "card-dark": "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
      fontFamily: {
        sans: ["var(--font-open-sans)", "Open Sans", "sans-serif"],
        brand: ["var(--font-roboto-mono)", "Roboto Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
