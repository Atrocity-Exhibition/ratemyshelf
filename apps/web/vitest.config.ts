import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      SKIP_ENV_VALIDATION: "1",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
