import { client } from "./db";
import { sql } from "./sql-libsql";

type Stmt = { sql: string; args: Array<unknown> };

interface Config {
  db: {
    execute: (stmt: Stmt) => boolean;
    batch: (stmts: Array<Stmt>) => boolean;
  };
}

async function init({ db }: Config) {
  await client.batch([
    sql`CREATE TABLE IF NOT EXISTS __migrations (
      id INTEGER PRIMARY KEY NOT NULL,
      migration_name TEXT NOT NULL,
      content BLOB NOT NULL,
      completed INTEGER DEFAULT 0 NOT NULL
    );`,
  ]);
}
