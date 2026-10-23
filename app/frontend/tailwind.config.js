/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "var(--color-base)", surface: "var(--color-surface)", raised: "var(--color-surface-raised)",
        accent: "var(--color-accent)", danger: "var(--color-danger)", text: "var(--color-text)",
      },
      spacing: { 1: "var(--space-1)", 2: "var(--space-2)", 3: "var(--space-3)", 4: "var(--space-4)", 5: "var(--space-5)", 6: "var(--space-6)", 8: "var(--space-8)" },
      borderRadius: { sm: "var(--radius-sm)", md: "var(--radius-md)", lg: "var(--radius-lg)", pill: "var(--radius-pill)" },
      boxShadow: { low: "var(--shadow-low)", high: "var(--shadow-high)" },
    },
  },
};
