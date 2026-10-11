import { rateLimit } from "express-rate-limit"
import { env } from "../config/env.js"

const MS_PER_MINUTE = 60_000

export const credentialsLimiter = rateLimit({
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MINUTES * MS_PER_MINUTE,
    limit: env.AUTH_RATE_LIMIT_MAX,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many attempts, try again later" },
    skip: () => env.ENV === "test",
})
