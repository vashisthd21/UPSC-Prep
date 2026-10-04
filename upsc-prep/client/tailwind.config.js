/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF9F5",
        ink: {
          DEFAULT: "#1C2541",
          soft: "#3A4363",
        },
        maroon: {
          DEFAULT: "#7A2E2E",
          light: "#9A4444",
          dark: "#5C2020",
        },
        gold: "#B8860B",
        success: "#2F6D4F",
        danger: "#B23A3A",
      },
      fontFamily: {
        serif: ["Lora", "Georgia", "serif"],
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      maxWidth: {
        prose: "72ch",
      },
    },
  },
  plugins: [],
};
