import { createClient } from "@libsql/client";
import type { Table } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as schema from "./schema";

// Resolve o arquivo fisico do banco apenas para uso local.
const databaseFile = resolveDatabaseFile();
const databaseUrl = pathToFileURL(databaseFile).toString();

export const client = createClient({
  url: databaseUrl,
});

// Ajusta pragmas sempre que estivermos usando arquivo local.
void (async () => {
  try {
    await client.execute({ sql: "PRAGMA journal_mode=WAL;" });
    await client.execute({ sql: "PRAGMA synchronous=FULL;" });
    await client.execute({ sql: "PRAGMA busy_timeout=5000;" });
  } catch (error) {
    console.warn("falha ao aplicar pragmas no banco local LibSQL", error);
  }
})();

const db = drizzle(client, { schema });

type FilterSchema<TSchema> = {
  [K in keyof TSchema as TSchema[K] extends Table ? K : never]: TSchema[K];
};

const tb: FilterSchema<typeof schema> = schema;

export { db, tb };

function resolveDatabaseFile() {
  // Permite sobrescrever o caminho completo por variaveis (definido no processo principal).
  const configured = process.env.DATABASE_FILE?.trim();
  if (configured) {
    const resolved = path.resolve(configured);
    ensureDirectory(resolved);
    return resolved;
  }

  const fallbackName = process.env.DATABASE_NAME?.trim() || "app.db";
  const fallback = path.resolve(process.cwd(), fallbackName);
  ensureDirectory(fallback);
  return fallback;
}

function ensureDirectory(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}
