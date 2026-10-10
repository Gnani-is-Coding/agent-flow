import type { NextFunction, Response, Request } from "express"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { HttpError } from "../helpers/errorHelpers.js"
import { env } from "../config/env.js"

const tokenPayloadSchema = z.object({
    id: z.string(),
    role: z.enum(["admin", "operator"]),
})

export type AuthUser = z.infer<typeof tokenPayloadSchema>

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser
        }
    }
}

export function auth(req: Request, _res: Response, next: NextFunction): void {
    const [scheme, token] = req.headers.authorization?.split(" ") ?? []
    if (scheme !== "Bearer" || !token) throw new HttpError(401, "Missing or malformed token")

    try {
        const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] })
        req.user = tokenPayloadSchema.parse(payload)
    } catch (e: unknown) {
        throw new HttpError(401, e instanceof jwt.TokenExpiredError ? "Token expired" : "Invalid token")
    }
    next()
}
