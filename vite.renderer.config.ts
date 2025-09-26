import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    entries: ["index.html"], // Ou 'src/index.html' se estiver em subdir
  },
});
