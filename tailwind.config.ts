import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        fortress: {
          bg: "#07111f",
          panel: "#0d1a2b",
          border: "#24344d",
          gold: "#f3c969",
          slate: "#b6c3d6",
          cyan: "#66d9ef",
          danger: "#f87171",
          success: "#4ade80"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(102,217,239,0.08), 0 18px 45px rgba(0,0,0,0.28)",
      },
      backgroundImage: {
        'fortress-radial': 'radial-gradient(circle at top, rgba(102,217,239,0.12), transparent 35%), radial-gradient(circle at bottom right, rgba(243,201,105,0.12), transparent 30%)'
      }
    },
  },
  plugins: [],
} satisfies Config;
