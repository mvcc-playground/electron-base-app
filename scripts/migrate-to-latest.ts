// const res = await client.execute(sql`SELECT sqlite_version() as version;`);
// const ress = await client.execute(sql`SELECT jsonb('["teste"]');`);
// console.log(res);
// console.log(ress);

import { client } from "../src-electron/lib/db/db";
import { createMigrator } from "../src-electron/lib/db/migrator";

const migrator = await createMigrator({
  db: client,
  migrationTable: "__migrations",
});

migrator.migrateToLatest();
