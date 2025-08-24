/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      animation: {
        shine: 'shine 2.5s linear infinite',
      },
      keyframes: {
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      },
      colors: {
        "abu-bg": "var(--abu-bg)",
        "abu-stroke": "var(--abu-stroke)",
        black: "var(--black)",
        grey: "var(--grey)",
        "light-green": "var(--light-green)",
        text: "var(--text)",
        triatry: "var(--triatry)",
        white: "var(--white)",
        "white-fade": "var(--white-fade)",
        // New color system
        primary: {
          DEFAULT: "#75BF44",
          light: "rgba(117, 191, 68, 0.1)",
          hover: "#68AB3C",
          50: "#F5FDF0",
          100: "#E8F9DD",
          200: "#D1F2BB",
          300: "#B0E88E",
          400: "#8BD85C",
          500: "#75BF44",
          600: "#5FA032",
          700: "#4A7D2A",
          800: "#3E6426",
          900: "#355423",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#EE5428",
          light: "rgba(238, 84, 40, 0.1)",
          hover: "#D64C24",
          50: "#FEF4F2",
          100: "#FDE6E1",
          200: "#FBD1C8",
          300: "#F7B2A2",
          400: "#F2886C",
          500: "#EE5428",
          600: "#DC3F1A",
          700: "#B83318",
          800: "#972D1A",
          900: "#7C2A1C",
          foreground: "#ffffff",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        // Add the new dark-blue color
        "dark-blue": "#1A1A2E",
      },
      fontFamily: {
        "text-medium-normal": "var(--text-medium-normal-font-family)",
        "text-regular-normal": "var(--text-regular-normal-font-family)",
        "text-regular-semi-bold": "var(--text-regular-semi-bold-font-family)",
        sans: [
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}