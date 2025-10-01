import { client } from "../src/lib/db/db";
import { createMigrator } from "../src/lib/db/migrator";

const migrator = await createMigrator({
  db: client,
  migrationTable: "__migrations",
  migrationDir: "drizzle",
});

await migrator.migrateToLatest();
