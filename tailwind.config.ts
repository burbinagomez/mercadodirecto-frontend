import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2f7d32", // farm green
          dark: "#1b5e20",
        },
      },
    },
  },
  plugins: [],
};
export default config;
