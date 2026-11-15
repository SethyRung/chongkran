import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["test/unit/*.{test,spec}.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "e2e",
          include: ["test/e2e/*.{test,spec}.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "nuxt",
          include: ["test/nuxt/**/*.{test,spec}.ts"],
          environment: "node",
        },
        resolve: {
          alias: {
            "#shared": new URL("./shared", import.meta.url).pathname,
            "bun:test": new URL("./test/stubs/bun-test.ts", import.meta.url).pathname,
            "bun:test/mock": new URL("./test/stubs/bun-test.ts", import.meta.url).pathname,
          },
        },
      },
    ],
  },
});
