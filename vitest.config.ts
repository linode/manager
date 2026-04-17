import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Global timeout configurations for all projects
    testTimeout: 30000, // 30 seconds per test
    hookTimeout: 30000, // 30 seconds for hooks
    teardownTimeout: 30000, // 30 seconds for teardown
    // Use threads for lower per-test overhead than forks (no process spawn)
    pool: 'threads',
    // Limit parallel workers to avoid overloading when running multiple shards
    maxWorkers: process.env.CI ? 2 : undefined,
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
