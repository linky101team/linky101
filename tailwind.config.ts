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
        purple: "var(--purple)",
        // Base
        bg: "var(--bg)",
        navy: "var(--navy)",
        card: "var(--card)",
        border: "var(--border)",
        "text-muted": "var(--text-muted)",
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
      },
      backgroundImage: {
        "gradient-pink-purple": "linear-gradient(135deg, var(--pink), var(--purple))",
        "gradient-sky-purple": "linear-gradient(135deg, var(--sky), var(--purple))",
        "gradient-purple-pink": "linear-gradient(135deg, var(--purple), var(--pink))",
        "gradient-yellow-orange": "linear-gradient(135deg, var(--yellow), var(--orange))",
        "gradient-green-sky": "linear-gradient(135deg, var(--green), var(--sky))",
      },
      borderWidth: {
        3: "3px",
      },
    },
  },
  plugins: [],
};
export default config;
