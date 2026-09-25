import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#000000",
          card: "#111111",
          elevated: "#1a1a1a",
          hover: "#1f1f1f",
        },
        border: {
          DEFAULT: "#222222",
          subtle: "#1c1c1c",
          strong: "#333333",
        },
        accent: {
          DEFAULT: "#ffffff",
          blue: "#3b82f6",
          green: "#22c55e",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
