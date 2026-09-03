import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: "#f8f5f0",   // Base background canvas
          100: "#ebe5d8",  // Elevated surface / card background
          200: "#dfd5c3",  // Divider & subtle border
          300: "#c4a484",  // Accent border / Ochre camel
          400: "#997354",  // Secondary warm brown
          500: "#6f4e37",  // Primary brand / Chestnut brown
          600: "#5c3f2b",  // Primary hover
          700: "#493222",  // Deep roast
          800: "#3d2b1f",  // Dark espresso / High-contrast text
          900: "#2a1c13",  // Deepest tone
        },
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(61, 43, 31, 0.05)",
        card: "0 1px 3px 0 rgba(61, 43, 31, 0.07), 0 1px 2px -1px rgba(61, 43, 31, 0.05)",
        elevated: "0 4px 6px -1px rgba(61, 43, 31, 0.08), 0 2px 4px -2px rgba(61, 43, 31, 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
