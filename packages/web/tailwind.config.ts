import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "omf-navy": "#003366",
        "omf-blue": "#0066CC",
        "omf-light-blue": "#E8F4FD",
        "omf-green": "#00A651",
        "omf-amber": "#F5A623",
        "omf-red": "#D0021B",
      },
    },
  },
  plugins: [],
};

export default config;
