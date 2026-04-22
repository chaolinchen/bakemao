import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        mao: {
          sky:    "#E6EEF5",
          cream:  "#FFFBF2",
          cream2: "#FFE1C7",
          cream3: "#FFE9D1",
          choco:  "#6B4A2F",
          ink:    "#4A3322",
          orange: "#C8602A",
          orange2:"#E8955A",
          gray:   "#9E8672",
          gray2:  "#B0A090",
        },
      },
      fontFamily: {
        baloo:       ["var(--font-baloo)", "'Baloo 2'", "sans-serif"],
        "roboto-mono":["var(--font-roboto-mono)", "'Roboto Mono'", "monospace"],
        "noto-sans": ["var(--font-noto-sans)", "'Noto Sans TC'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
