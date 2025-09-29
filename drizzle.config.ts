import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "turso",
  dbCredentials: {
    url: "file:dev.db",
  },
  schema: "src-electron/lib/db/schema.ts",
});
