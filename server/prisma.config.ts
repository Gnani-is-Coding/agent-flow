import { existsSync } from "node:fs";
import { defineConfig, env } from "prisma/config";

if (existsSync(".env.local")) process.loadEnvFile(".env.local") // local setup only.

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
