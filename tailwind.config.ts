import type { Config } from "tailwindcss"

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    "group-data-[state=collapsed]:w-0",
    "opacity-0",
    "pointer-events-none",
    "peer-data-[state=collapsed]:peer-data-[collapsible=offcanvas]:ml-0",
    "peer-data-[state=collapsed]:peer-data-[variant=inset]:peer-data-[collapsible=offcanvas]:m-2",
  ],
} satisfies Config
