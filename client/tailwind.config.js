/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1677ff" /* Ant Design Default Blue */,
        "background-light": "#f0f2f5",
        "background-dark": "#000000",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  corePlugins: {
    preflight: false /* Disable Tailwind preflight to avoid conflict with Ant Design */,
  },
  plugins: [],
};
