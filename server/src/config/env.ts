import { z } from "zod"

const envSchema = z.object({
    PORT: z.coerce.number().int().positive(),
    ENV: z.string(),
    ALLOWED_ORIGINS: z.string().transform((origins) => origins.split(",").map((origin) => origin.trim())),
    MORGAN_LOG_FORMAT: z.string().default("dev"),
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(2, "must be at least 2 characters"),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
    console.error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`)
    process.exit(1)
}

export const env = parsed.data
