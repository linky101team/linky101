import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: "var(--purple)",
        cyan: "var(--cyan)",
        pink: "var(--pink)",
        sky: "var(--sky)",
        "sky-deep": "var(--sky-deep)",
        bg: "var(--bg)",
        card: "var(--card)",
        border: "var(--border)",
        "text-muted": "var(--text-muted)",
        ink: "var(--ink)",
        yellow: "var(--yellow)",
        green: "var(--green)",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
    },
  },
  plugins: [],
};
export default config;
