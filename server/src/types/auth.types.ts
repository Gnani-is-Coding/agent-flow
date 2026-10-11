import { z } from "zod"
import { Role } from "../generated/prisma/enums.js"
import type { User } from "../generated/prisma/client.js"

const emailSchema = z.string().trim().toLowerCase().pipe(z.email())

export const registerSchema = z.object({
    name: z.string().trim().min(1).max(100),
    email: emailSchema,
    // bcrypt ignores bytes past 72
    password: z.string().min(8).max(72),
})

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1),
})

export const TOKEN_TYPES = ["access", "refresh"] as const

export const tokenPayloadSchema = z.object({
    id: z.string(),
    role: z.enum(Role),
    type: z.enum(TOKEN_TYPES),
})

export type RegisterPayload = z.infer<typeof registerSchema>
export type LoginPayload = z.infer<typeof loginSchema>
export type TokenType = (typeof TOKEN_TYPES)[number]
export type AuthUser = Omit<z.infer<typeof tokenPayloadSchema>, "type">
export type PublicUser = Omit<User, "passwordHash">

export interface AuthTokens {
    authToken: string
    refreshToken: string
}

export interface AuthResult extends AuthTokens {
    user: PublicUser
}
