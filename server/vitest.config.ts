import { existsSync } from "node:fs"
import { defineConfig } from "vitest/config"

if (existsSync(".env.local")) process.loadEnvFile(".env.local")

export default defineConfig({
    test: {
        env: { ENV: "test" },
        fileParallelism: false,
        coverage: { reporter: ["text"], include: ["src/**/*.ts"], exclude: ["src/generated/**", "src/scripts/**", "src/index.ts"] },
    },
})
