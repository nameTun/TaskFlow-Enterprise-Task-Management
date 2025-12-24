/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  // important: '#root', // Bật dòng này nếu bạn muốn Tailwind "vô đối" (luôn thắng Antd), nhưng dùng Layer ở trên là cách sạch hơn.
  // content: ["./index.html", "./**/*.{js,ts,jsx,tsx}"],
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
