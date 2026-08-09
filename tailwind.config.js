/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#3BB273",
        accent: "#5CD68C",
        background: "#EEF2F7",
        card: "#FFFFFF",
        text: "#111827",
        secondary: "#6B7280",
        border: "rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        "3xl": "24px",
      },
      fontSize: {
        display: ["34px", { lineHeight: "40px", fontWeight: "700" }],
        heading: ["28px", { lineHeight: "34px", fontWeight: "700" }],
        title: ["20px", { lineHeight: "26px", fontWeight: "600" }],
        body: ["16px", { lineHeight: "22px", fontWeight: "400" }],
        caption: ["13px", { lineHeight: "18px", fontWeight: "500" }],
      },
      spacing: {
        2: "8px",
        4: "16px",
        6: "24px",
        8: "32px",
      },
    },
  },
  plugins: [],
};
