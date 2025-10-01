import { createClient } from "@libsql/client";
import type { Table } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as schema from "./schema";

const DEFAULT_DEV_DB = path.resolve(process.cwd(), "dev.db");
const DEFAULT_PROD_DB = path.resolve(process.cwd(), "db", "app.db");

function resolveDatabaseLocation() {
  const configured = process.env.LIBSQL_FILE?.trim();
  const isProduction = process.env.NODE_ENV === "production";

  if (configured) {
    if (!looksLikeRemoteUrl(configured)) {
      return toLocalTarget(configured);
    }

    return { url: configured, isLocalFile: false } as const;
  }

  return toLocalTarget(isProduction ? DEFAULT_PROD_DB : DEFAULT_DEV_DB);
}

function looksLikeRemoteUrl(value: string) {
  return value.includes("://") && !value.startsWith("file:");
}

function toLocalTarget(target: string) {
  const filePath = target.startsWith("file:")
    ? fileURLToPath(new URL(target))
    : path.resolve(target);

  ensureDirectory(filePath);

  return {
    url: target.startsWith("file:") ? target : pathToFileURL(filePath).toString(),
    isLocalFile: true,
  } as const;
}

function ensureDirectory(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

const { url: databaseUrl, isLocalFile } = resolveDatabaseLocation();

export const client = createClient({
  url: databaseUrl,
});

if (isLocalFile) {
  void (async () => {
    try {
      await client.execute({ sql: "PRAGMA journal_mode=WAL;" });
      await client.execute({ sql: "PRAGMA synchronous=FULL;" });
      await client.execute({ sql: "PRAGMA busy_timeout=5000;" });
    } catch (error) {
      console.warn("falha ao aplicar pragmas no banco local LibSQL", error);
    }
  })();
}

const db = drizzle(client, { schema });

type FilterSchema<TSchema> = {
  [K in keyof TSchema as TSchema[K] extends Table ? K : never]: TSchema[K];
};

const tb: FilterSchema<typeof schema> = schema;

export { db, tb };
