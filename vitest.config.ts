import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["packages/*/src/**/*.test.ts", "packages/*/src/__tests__/**/*.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    testTimeout: 10_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["packages/*/src/**/*.ts"],
      exclude: ["**/*.test.ts", "**/__tests__/**", "**/dist/**"],
    },
  },
});