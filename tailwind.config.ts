import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Neural Salvage Design System
        neural: {
          black: "#0a0a0a",
          dark: "#111111",
          medium: "#1a1a1a",
          blue: "#0070f3",
          cyan: "#00d9ff",
          purple: "#7928ca",
          white: "#ffffff",
          gray: {
            100: "#fafafa",
            200: "#eaeaea",
            400: "#999999",
            600: "#666666",
            800: "#333333",
          },
          success: "#00e676",
          warning: "#ffab00",
          error: "#ff5252",
          info: "#00b8d4",
        },
        // Retro-Futuristic Salvage Theme
        retro: {
          orange: "#FF6B35",
          yellow: "#F7931E",
          teal: "#00CFC1",
          purple: "#9B59B6",
          cream: "#FFF8E7",
        },
        salvage: {
          dark: "#1A1A1F",
          metal: "#2C2C34",
          rust: "#4A4A52",
          dust: "#6B6B73",
          light: "#F5F5F0",
        },
        glow: {
          cyan: "#00E5FF",
          magenta: "#FF00FF",
          lime: "#CCFF00",
          amber: "#FFA500",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Neural theme animations
        "neural-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "neural-glow": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(0, 112, 243, 0.2)" },
          "50%": { boxShadow: "0 0 20px rgba(0, 112, 243, 0.4)" },
        },
        "neural-flow": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-100%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "retro-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 207, 193, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 207, 193, 0.6)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "neural-pulse": "neural-pulse 3s ease-in-out infinite",
        "neural-glow": "neural-glow 2s ease-in-out infinite",
        "neural-flow": "neural-flow 20s linear infinite",
        shimmer: "shimmer 2s infinite linear",
        "retro-glow": "retro-glow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "grid-pattern": "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;