import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    react: "src/react/index.ts",
    "react-rhf": "src/react-rhf/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  clean: true,
  external: ["react", "react-hook-form"],
  treeshake: true,
  sourcemap: true,
});
