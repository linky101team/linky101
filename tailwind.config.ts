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
        // Core brand identity
        pink: "var(--pink)",
        sky: "var(--sky)",
        "sky-deep": "var(--sky-deep)",
        purple: "var(--purple)",
        // Base
        bg: "var(--bg)",
        navy: "var(--navy)",
        card: "var(--card)",
        border: "var(--border)",
        "text-muted": "var(--text-muted)",
        ink: "var(--ink)",
        // In-app accents (game mechanics only)
        yellow: "var(--yellow)",
        green: "var(--green)",
        orange: "var(--orange)",
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "sans-serif"],
      },
      boxShadow: {
        "glow-pink": "var(--glow-pink)",
        "glow-sky": "var(--glow-sky)",
        "glow-purple": "var(--glow-purple)",
        "glow-yellow": "var(--glow-yellow)",
        "glow-green": "var(--glow-green)",
        card: "var(--shadow-card)",
      },
      backgroundImage: {
        "gradient-pink-purple": "linear-gradient(135deg, var(--pink), var(--purple))",
        "gradient-sky-purple": "linear-gradient(135deg, var(--sky), var(--sky-deep))",
        "gradient-purple-pink": "linear-gradient(135deg, var(--purple), var(--pink))",
        "gradient-yellow-orange": "linear-gradient(135deg, var(--yellow), var(--orange))",
        "gradient-green-sky": "linear-gradient(135deg, var(--green), var(--sky))",
        "gradient-primary": "linear-gradient(135deg, var(--sky), var(--sky-deep))",
      },
      borderWidth: {
        3: "3px",
      },
    },
  },
  plugins: [],
};
export default config;
