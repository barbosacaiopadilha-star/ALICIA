import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FDFCFA",
        canvas: "#F6F3EE",
        ink: "#17160F",
        "ink-soft": "#524E43",
        "ink-faint": "#8B8678",
        gold: "#A9824F",
        "gold-soft": "#D9C6A3",
        hairline: "#E7E2D8",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      maxWidth: {
        editorial: "42rem",
      },
      transitionTimingFunction: {
        calm: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
