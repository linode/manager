import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Global timeout configurations for all projects
    testTimeout: 30000, // 30 seconds per test
    hookTimeout: 30000, // 30 seconds for hooks
    teardownTimeout: 30000, // 30 seconds for teardown
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
