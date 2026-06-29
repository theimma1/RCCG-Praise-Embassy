/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e8eaf6",
          100: "#c5cae9",
          300: "#7986cb",
          500: "#3f51b5",
          700: "#303f9f",
          800: "#1a237e",
          900: "#0d1557",
        },
        gold: {
          300: "#ffd54f",
          500: "#f9a825",
          700: "#f57f17",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
