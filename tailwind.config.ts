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
        // ===== NEURAL SALVAGE CYBERPUNK THEME =====
        // Core Palette from Design System
        'void-black': '#0A0E14',
        'deep-space': '#151B23',
        'panel-dark': '#0F141E',
        'quantum-blue': '#3D5A80',
        'data-cyan': '#6FCDDD',
        'archive-amber': '#E8A55C',
        'warning-orange': '#D97742',
        'terminal-green': '#7FB069',
        'oxidized-copper': '#A67C52',
        'ash-gray': '#BFC0C0',
        'pure-white': '#F4F4F4',
        
        // Organized by usage
        salvage: {
          dark: '#0A0E14',      // Main background
          medium: '#151B23',    // Cards, panels
          panel: '#0F141E',     // Alternate panels
          steel: '#2B3A42',     // Borders
          rust: '#4A4A52',      // Disabled states
          dust: '#6B6B73',      // Muted text
          light: '#F4F4F4',     // Primary text
        },
        neon: {
          cyan: '#6FCDDD',      // Primary accent
          blue: '#3D5A80',      // Secondary accent
          amber: '#E8A55C',     // Highlights
          orange: '#D97742',    // Warnings
          green: '#7FB069',     // Success
        },
        retro: {
          orange: '#D97742',
          amber: '#E8A55C',
          cyan: '#6FCDDD',
          copper: '#A67C52',
        },
        // Legacy support (for existing code)
        neural: {
          black: "#0A0E14",
          dark: "#151B23",
          medium: "#1a1a1a",
          blue: "#3D5A80",
          cyan: "#6FCDDD",
          purple: "#7928ca",
          white: "#F4F4F4",
          gray: {
            100: "#F4F4F4",
            200: "#BFC0C0",
            400: "#6B6B73",
            600: "#4A4A52",
            800: "#2B3A42",
          },
          success: "#7FB069",
          warning: "#E8A55C",
          error: "#D97742",
          info: "#6FCDDD",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        // ===== CYBERPUNK 3D ANIMATIONS =====
        "organic-float": {
          "0%, 100%": { transform: "translateY(0) rotateX(1deg) rotateZ(0.5deg)" },
          "33%": { transform: "translateY(-15px) rotateX(2deg) rotateZ(-0.3deg)" },
          "66%": { transform: "translateY(-8px) rotateX(0.5deg) rotateZ(0.8deg)" },
        },
        "complex-rotate": {
          "0%": { transform: "perspective(1000px) rotateY(0deg) rotateX(0deg)" },
          "25%": { transform: "perspective(1000px) rotateY(90deg) rotateX(5deg)" },
          "50%": { transform: "perspective(1000px) rotateY(180deg) rotateX(0deg)" },
          "75%": { transform: "perspective(1000px) rotateY(270deg) rotateX(-5deg)" },
          "100%": { transform: "perspective(1000px) rotateY(360deg) rotateX(0deg)" },
        },
        "logo-float": {
          "0%": { transform: "rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px)" },
          "15%": { transform: "rotateX(15deg) rotateY(45deg) rotateZ(5deg) translateZ(20px)" },
          "30%": { transform: "rotateX(-10deg) rotateY(90deg) rotateZ(-8deg) translateZ(10px)" },
          "45%": { transform: "rotateX(20deg) rotateY(180deg) rotateZ(12deg) translateZ(30px)" },
          "60%": { transform: "rotateX(-15deg) rotateY(270deg) rotateZ(-5deg) translateZ(15px)" },
          "75%": { transform: "rotateX(10deg) rotateY(315deg) rotateZ(10deg) translateZ(25px)" },
          "90%": { transform: "rotateX(-5deg) rotateY(350deg) rotateZ(-3deg) translateZ(5px)" },
          "100%": { transform: "rotateX(0deg) rotateY(360deg) rotateZ(0deg) translateZ(0px)" },
        },
        "drift": {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "100%": { transform: "translate(-30px, 40px) scale(1.05)" },
        },
        "slide-shimmer": {
          "0%, 100%": { 
            opacity: "0.4",
            left: "5%",
            right: "15%"
          },
          "50%": { 
            opacity: "0.9",
            left: "15%",
            right: "5%"
          },
        },
        "panel-pulse": {
          "0%, 100%": { 
            borderColor: "rgba(111, 205, 221, 0.25)",
            boxShadow: "inset 0 0 15px rgba(111, 205, 221, 0.08)"
          },
          "50%": { 
            borderColor: "rgba(111, 205, 221, 0.45)",
            boxShadow: "inset 0 0 35px rgba(111, 205, 221, 0.18)"
          },
        },
        "bracket-glow": {
          "0%, 100%": {
            borderColor: "rgba(111, 205, 221, 0.4)",
            boxShadow: "0 0 10px rgba(111, 205, 221, 0.2)"
          },
          "50%": {
            borderColor: "rgba(232, 165, 92, 0.6)",
            boxShadow: "0 0 20px rgba(232, 165, 92, 0.3)"
          },
        },
        "twinkle": {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "25%": { opacity: "0.9", transform: "scale(1.2)" },
          "50%": { opacity: "0.5", transform: "scale(0.9)" },
          "75%": { opacity: "1", transform: "scale(1.1)" },
        },
        "scan": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(10px)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        // ===== CYBERPUNK 3D ANIMATIONS =====
        "organic-float": "organic-float 9s ease-in-out infinite",
        "complex-rotate": "complex-rotate 18s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "logo-float": "logo-float 22s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite",
        "drift": "drift 25s ease-in-out infinite alternate",
        "slide-shimmer": "slide-shimmer 4s ease-in-out infinite",
        "panel-pulse": "panel-pulse 5s ease-in-out infinite",
        "bracket-glow": "bracket-glow 6.5s ease-in-out infinite",
        "twinkle": "twinkle 6s linear infinite",
        "scan": "scan 22s linear infinite",
        "pulse-glow": "pulse-glow 1.5s ease-in-out infinite",
        // Legacy
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite linear",
        "float": "float 3s ease-in-out infinite",
      },
      fontFamily: {
        'space-mono': ['"Space Mono"', 'monospace'],
        'rajdhani': ['"Rajdhani"', 'sans-serif'],
        'jetbrains': ['"JetBrains Mono"', 'monospace'],
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