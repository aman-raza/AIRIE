import fs from "node:fs";
import path from "node:path";

const envFiles = [".en.local", ".env.local", ".env"];
const parsedEnvCache = new Map<string, Record<string, string>>();

function parseEnvFile(filePath: string) {
  if (parsedEnvCache.has(filePath)) {
    return parsedEnvCache.get(filePath)!;
  }

  const parsed: Record<string, string> = {};

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^['\"]|['\"]$/g, "");

      if (key) {
        parsed[key] = value;
      }
    }
  }

  parsedEnvCache.set(filePath, parsed);
  return parsed;
}

export function getEnvVar(name: string): string | undefined {
  if (process.env[name]) {
    return process.env[name];
  }

  const projectRoot = process.cwd();

  for (const envFile of envFiles) {
    const fullPath = path.join(projectRoot, envFile);
    const parsed = parseEnvFile(fullPath);
    if (parsed[name]) {
      return parsed[name];
    }
  }

  return undefined;
}
