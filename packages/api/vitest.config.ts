import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@elt/shared": resolve(__dirname, "../shared/src/index.ts"),
    },
  },
});
