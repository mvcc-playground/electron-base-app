import type { Client } from "@libsql/client";
import { glob } from "glob";
import { readFile } from "node:fs/promises";

// type Stmt = { sql: string; args: Array<unknown> };

// interface DataBaseAdapter {
//   execute: (stmt: Stmt) => Promise<unknown>;
//   batch: (stmts: Array<Stmt>) => Promise<unknown>;
// }
interface Config {
  db: Client;
  migrationTable?: string;
  migrationDir?: string;
}
export interface Migration {
  path: string;
  name: string;
  id: number;
  content: Array<string>;
}

type Migrations = Migration[];

export async function createMigrator(config: Config) {
  const {
    db,
    migrationTable = "__migrations",
    migrationDir = "migrations",
  } = config;
  console.info("iniciando migrations");
  await init({ db, migrationTable });
  return {
    migrateToLatest: () =>
      migrateToLatest({ db, migrationTable, migrationDir }),
  };
}

function splitSqlIntoStatements(sql: string): string[] {
  // Divide o SQL em statements individuais, ignorando comentários e linhas vazias
  return sql
    .split(";") // Divide por ;
    .map((stmt) => stmt.trim()) // Remove espaços extras
    .filter((stmt) => stmt && !stmt.startsWith("--")); // Remove vazios e comentários que começam com --
}

async function init({
  db,
  migrationTable,
}: {
  db: Client;
  migrationTable: string;
}) {
  await db.batch([
    {
      sql: `CREATE TABLE IF NOT EXISTS ${migrationTable} (
        id INTEGER PRIMARY KEY NOT NULL,
        migration_name TEXT NOT NULL,
        content BLOB NOT NULL,
        completed INTEGER DEFAULT 0 NOT NULL
      );`,
      args: [],
    },
  ]);
}

function validadeFileName(file_path: string) {
  const fileName = file_path.split("/").pop();
  if (!fileName) {
    throw new Error(`nome do arquivo invalido: ${fileName}`);
  }

  const [baseName, extension] = fileName.split(".");
  if (extension !== "sql" || !baseName) {
    throw new Error(`formato do arquivo invalido: ${fileName}`);
  }

  const firstUnderscoreIndex = baseName.indexOf("_");
  if (firstUnderscoreIndex === -1) {
    throw new Error(
      `nome do arquivo invalido, sem numero de migração: ${fileName}`
    );
  }

  const migrationNumberStr = baseName.substring(0, firstUnderscoreIndex);
  const migrationName = baseName.substring(firstUnderscoreIndex + 1);

  const migrationNumber = Number(migrationNumberStr);
  if (Number.isNaN(migrationNumber)) {
    throw new Error(`numero de migração invalido: ${migrationNumberStr}`);
  }
  return { migrationNumber: migrationNumber.toString(), migrationName };
}

export async function migrateToLatest({
  db,
  migrationTable,
  migrationDir,
}: {
  db: Client;
  migrationTable: string;
  migrationDir: string;
}) {
  let migrations: Migrations = [];
  console.log(
    `procurando por migrations em: ${process.cwd()}/${migrationDir} (tabela: ${migrationTable})`
  );
  const filePaths = await glob(`${migrationDir}/*.sql`, { cwd: process.cwd() });
  if (filePaths.length === 0) {
    console.error("nenhuma migration encontrada");
    return;
  }
  console.log(`encontrado ${filePaths.length} arquivo(s) de migration`);
  for (const file_path of filePaths) {
    const { migrationName, migrationNumber } = validadeFileName(file_path);
    // Substituição do Bun.file por fs/promises.readFile
    const content = await readFile(file_path, "utf-8");
    migrations.push({
      path: file_path,
      name: migrationName,
      id: Number(migrationNumber),
      content: splitSqlIntoStatements(content),
    });
  }
  const appliedMigrations = await db.execute({
    sql: `SELECT id FROM ${migrationTable} ORDER BY id ASC`,
    args: [],
  });
  const appliedIds = new Set(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appliedMigrations.rows
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((row: any) => Number(row.id))
      .filter((id) => Number.isFinite(id))
  );
  // garantir que seja aplicadas em ordem numérica
  migrations = migrations.sort((a, b) => a.id - b.id);
  // Find and apply new migrations
  const summary = {
    total: migrations.length,
    alreadyApplied: 0,
    appliedNow: 0,
  };
  for (const migration of migrations) {
    if (!appliedIds.has(migration.id)) {
      try {
        const {
          rows: [existMigration],
        } = await db.execute({
          sql: `SELECT migration_name FROM ${migrationTable} WHERE id = ?`,
          args: [migration.id],
        });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (existMigration) {
          throw new Error(
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            `Migration ${migration.id.toString()} already exist: ${existMigration.migration_name?.toString()} is not ${migration.name}`
          );
        }
        console.info("exec: ", migration.id, migration.name);
        // Divida o conteúdo up em statements e execute com batch para suportar múltiplas instruções
        const upStatements = migration.content.map((statement) => ({
          sql: statement,
          args: [],
        }));
        if (upStatements.length > 0) {
          await db.batch(upStatements);
        }
        await db.execute({
          sql: `INSERT INTO ${migrationTable} (id, migration_name, content) VALUES (?, ?, ?)`,
          args: [
            migration.id,
            migration.name,
            JSON.stringify(migration.content),
          ],
        });
        console.log(`✓ Applied migration: ${migration.name}`);
        summary.appliedNow += 1;
      } catch (error) {
        console.error(`❌ Failed to apply migration ${migration.name}:`, error);
        throw error;
      }
    } else {
      console.log(
        `✓ Migration ${migration.id.toString()} already applied: ${migration.name}`
      );
      summary.alreadyApplied += 1;
    }
  }
  console.info(
    `migrations finalizadas. total: ${summary.total}, aplicadas agora: ${summary.appliedNow}, ja aplicadas: ${summary.alreadyApplied}`
  );
  // verificar qual foi a ultima ou se é a primeira.
  // fazer a migração
}
