import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: ["@libsql/client", "@libsql/darwin-arm64"],
    },
    commonjsOptions: {
      dynamicRequireTargets: ["@libsql/darwin-arm64"],
    },
  },
});
