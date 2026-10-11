import jwt from "jsonwebtoken"
import { env } from "../config/env.js"
import { HttpError } from "./errorHelpers.js"
import { tokenPayloadSchema, type AuthUser, type TokenType } from "../types/auth.types.js"

const SECONDS_PER_MINUTE = 60
const SECONDS_PER_DAY = 86_400

export const TOKEN_TTL_SECONDS: Record<TokenType, number> = {
    access: env.ACCESS_TOKEN_TTL_MINUTES * SECONDS_PER_MINUTE,
    refresh: env.REFRESH_TOKEN_TTL_DAYS * SECONDS_PER_DAY,
}

export function signToken({ id, role }: AuthUser, type: TokenType): string {
    return jwt.sign({ id, role, type }, env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: TOKEN_TTL_SECONDS[type],
    })
}

export function verifyToken(token: string, type: TokenType): AuthUser {
    let payload: unknown
    try {
        payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] })
    } catch (e: unknown) {
        throw new HttpError(401, e instanceof jwt.TokenExpiredError ? "Token expired" : "Invalid token")
    }

    const parsed = tokenPayloadSchema.safeParse(payload)
    if (!parsed.success || parsed.data.type !== type) throw new HttpError(401, "Invalid token")
    return { id: parsed.data.id, role: parsed.data.role }
}
