import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Load .env file into process.env (does not override existing shell vars).
 */
export function loadEnvFile(filename) {
  const envPath = resolve(process.cwd(), filename);
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

export function loadAppEnv() {
  loadEnvFile('.env');
  loadEnvFile('.env.local');
}

export function getAppPort() {
  loadAppEnv();
  return process.env.PORT || '3020';
}
