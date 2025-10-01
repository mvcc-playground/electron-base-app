import { client } from "./db";
import { createMigrator } from "./migrator";

export async function runMigrations({
  migrationTable = "__migrations",
  migrationDir = "drizzle",
}: {
  migrationTable?: string;
  migrationDir?: string;
} = {}) {
  const migrator = await createMigrator({
    db: client,
    migrationTable,
    migrationDir,
  });

  await migrator.migrateToLatest();
}
