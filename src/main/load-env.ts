import { app } from "electron";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

const envFile = findEnvFile();

if (envFile) {
  dotenv.config({ path: envFile });
}

function findEnvFile() {
  const override = process.env.ELECTRON_ENV_FILE;
  if (override) {
    const resolved = resolveCandidate(override);
    if (resolved && fs.existsSync(resolved)) {
      return resolved;
    }
  }

  if (app.isPackaged) {
    const packagedProd = path.join(process.resourcesPath, ".env.prod");
    if (fs.existsSync(packagedProd)) {
      return packagedProd;
    }

    const packagedDefault = path.join(process.resourcesPath, ".env");
    if (fs.existsSync(packagedDefault)) {
      return packagedDefault;
    }

    return undefined;
  }

  const devPreferred = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(devPreferred)) {
    return devPreferred;
  }

  const devProd = path.resolve(process.cwd(), ".env.prod");
  if (fs.existsSync(devProd)) {
    return devProd;
  }

  return undefined;
}

function resolveCandidate(candidate: string) {
  if (path.isAbsolute(candidate)) {
    return candidate;
  }

  const cwdPath = path.resolve(process.cwd(), candidate);
  if (fs.existsSync(cwdPath)) {
    return cwdPath;
  }

  if (app.isPackaged) {
    const packagedPath = path.join(process.resourcesPath, candidate);
    if (fs.existsSync(packagedPath)) {
      return packagedPath;
    }
  }

  return undefined;
}

