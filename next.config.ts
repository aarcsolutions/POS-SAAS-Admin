import type { NextConfig } from "next";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocalPort(): string {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return process.env.PORT || "3020";

  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (trimmed.startsWith("PORT=")) {
      return trimmed.slice("PORT=".length).trim() || "3020";
    }
  }

  return process.env.PORT || "3020";
}

const tenantHost = process.env.NEXT_PUBLIC_TENANT_HOST || "localhost";
const port = loadEnvLocalPort();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_PORT: port,
    NEXT_PUBLIC_TENANT_DOMAIN: `${tenantHost}:${port}`,
  },
};

export default nextConfig;
