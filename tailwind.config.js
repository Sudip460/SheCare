/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        muted: "#64748b",
        health: {
          blue: "#dff2ff",
          green: "#dff8ee",
          mint: "#6dd6b8",
          sky: "#74b8ff",
          rose: "#ff7d9c",
          purple: "#7c3aed",
          magenta: "#ec4899",
          lavender: "#f4edff",
        },
      },
      boxShadow: {
        soft: "0 20px 60px rgba(23, 32, 42, 0.08)",
        glass: "0 18px 45px rgba(65, 105, 145, 0.12)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
