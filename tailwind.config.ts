import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15181D",
        panel: "#1E222A",
        panelLight: "#262B34",
        paper: "#EDE6D8",
        paperDim: "#C9BFA9",
        manila: "#C9A876",
        manilaDeep: "#9C7A46",
        alert: "#C1443C",
        alertDim: "#7A2B26",
        wire: "#3A404B",
      },
      fontFamily: {
        case: ["var(--font-case)", "monospace"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        pin: "0 2px 6px rgba(0,0,0,0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
