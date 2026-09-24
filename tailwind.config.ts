import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        volt: {
          300: "#e4ff54",
          400: "#d6ff1a",
          500: "#ccff00",
          600: "#b0e000",
          700: "#8fb800",
        },
        carbon: {
          950: "#090a0e",
          900: "#101217",
          850: "#15181f",
          800: "#1c202a",
          750: "#232835",
          700: "#2c3342",
          600: "#3d4659",
          500: "#5a6680",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          "ui-monospace",
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
