import { createClient } from "@libsql/client";
import type { Table } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// const client = env.IS_PROD
//   ? createClient({
//       url: env.TURSO_DATABASE_URL,
//       authToken: env.TURSO_AUTH_TOKEN,
//     })
//   : // : createClient({ url: 'file:./.tmp/dev.db' })
//     createClient({ url: "file:./.tmp/dev.db" });

export const client = createClient({
  url: "file:dev.db",
});

const db = drizzle(client, { schema });

type FilterSchema<TSchema> = {
  [K in keyof TSchema as TSchema[K] extends Table ? K : never]: TSchema[K];
};

const tb: FilterSchema<typeof schema> = schema;

export { db, tb };
