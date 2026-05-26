/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
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
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          coral: "#FF385C",
          coralSoft: "#FF6B81",
          pink: "#FFF1F2",
          teal: "#00A699",
          blue: "#3B82F6",
          orange: "#FFB400",
          ink: "#222222",
          slate: "#717171",
          line: "#EBEBEB",
          canvas: "#F7F7F7",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        airbnb: "20px",
        "airbnb-lg": "24px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      boxShadow: {
        airbnb: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
        "airbnb-hover": "0 2px 4px rgba(0,0,0,0.06), 0 12px 28px rgba(0,0,0,0.1)",
        "airbnb-lg": "0 6px 16px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.45s ease-out",
        "slide-up": "slideUp 0.45s ease-out",
        "count-up": "countUp 0.7s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
