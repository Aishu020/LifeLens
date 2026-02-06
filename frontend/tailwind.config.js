/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Satoshi'", "ui-sans-serif", "system-ui"],
        body: ["'Manrope'", "ui-sans-serif", "system-ui"],
      },
      colors: {
        night: "#0F172A",
        mist: "#F8FAFC",
        glass: "rgba(255, 255, 255, 0.6)",
        ink: "#111827",
        accent: "#7C3AED",
        ocean: "#38BDF8",
      },
      boxShadow: {
        glow: "0 12px 40px rgba(124, 58, 237, 0.18)",
        card: "0 18px 45px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        hero: "radial-gradient(circle at top left, #FDF2F8 0%, #EEF2FF 35%, #ECFEFF 70%)",
        aurora:
          "radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.25), transparent 45%), radial-gradient(circle at 80% 10%, rgba(56, 189, 248, 0.25), transparent 40%), radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.15), transparent 50%)",
      },
      borderRadius: {
        xl: "1.2rem",
        "2xl": "1.5rem",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
