import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./app/**/*.{js,jsx,ts,tsx}",
     "./pages/**/*.{js,jsx,ts,tsx}", // <- Ajustado para "Components" com C maiúsculo
     "./components/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  jsxFramework: 'react',

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        fonts: {
          // Aponta diretamente para a variável do Next.js que criamos no Layout
          sans: { value: 'var(--font-manrope), sans-serif' }
        }
      }
    },
  },

  // The output directory for your css system
  outdir: "styled-system",
});
