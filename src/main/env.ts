import { app } from "electron";
import path from "node:path";
import { z } from "zod";

// Valida as variaveis de ambiente usadas pelo processo principal.
const EnvSchema = z
  .object({
    DATABASE_NAME: z
      .string()
      .trim()
      .min(1, "DATABASE_NAME nao pode ser vazio")
      .default("app.db"),
  })
  .transform((value) => {
    const isDev = !app.isPackaged;

    return {
      DATABASE_NAME: value.DATABASE_NAME,
      DATABASE_FILE: isDev
        ? path.join(process.cwd(), ".tmp", value.DATABASE_NAME)
        : path.join(app.getPath("userData"), value.DATABASE_NAME),
    };
  });

export const env = EnvSchema.parse(process.env);
export type MainEnv = typeof env;
