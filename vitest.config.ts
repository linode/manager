import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      "packages/api-v4",
      "packages/manager",
      "packages/search",
      "packages/shared",
      "packages/ui",
      "packages/utilities",
    ],
  },
});
