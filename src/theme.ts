import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          bg: { value: "#0d1410" },
          card: { value: "#161e19" },
          border: { value: "#1f2923" },
          green: { value: "#54f085" },
          yellow: { value: "#facc15" },
          orange: { value: "#fb923c" },
        },
      },
      fonts: {
        heading: { value: "system-ui, sans-serif" },
        body: { value: "system-ui, sans-serif" },
      },
    },
  },
  globalCss: {
    "html, body": {
      bg: "#0d1410",
      color: "white",
      margin: 0,
      padding: 0,
    },
  },
});

export const system = createSystem(defaultConfig, config);
