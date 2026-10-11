import { z } from "zod"

const envSchema = z.object({
    PORT: z.coerce.number().int().positive(),
    ENV: z.string(),
    ALLOWED_ORIGINS: z.string().transform((origins) => origins.split(",").map((origin) => origin.trim())),
    MORGAN_LOG_FORMAT: z.string().default("dev"),
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(32, "must be at least 32 characters"),
    ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
    AUTH_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(15),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
    console.error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`)
    process.exit(1)
}

export const env = parsed.data
