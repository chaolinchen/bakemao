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
        bakemao: {
          accent: "#C8602A",
          cream: "#F7F0E6",
          ink: "#3D2918",
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        "dm-mono": ["var(--font-dm-mono)", "ui-monospace", "monospace"],
        "noto-sans": ["var(--font-noto-sans)", "sans-serif"],
        "noto-serif": ["var(--font-noto-serif)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
