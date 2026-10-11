import type { CookieOptions, Response } from "express"
import { env } from "../config/env.js"
import { TOKEN_TTL_SECONDS } from "./tokens.js"
import type { AuthTokens } from "../types/auth.types.js"

export const AUTH_BASE_PATH = "/api/v1/auth"
export const ACCESS_COOKIE = "accessToken"
export const REFRESH_COOKIE = "refreshToken"
const MS_PER_SECOND = 1000

const baseOptions: CookieOptions = {
    httpOnly: true,
    secure: env.ENV === "prod",
    sameSite: "strict",
}
const accessOptions: CookieOptions = { ...baseOptions, path: "/" }
// browser only sends the refresh token to /rotate and /logout
const refreshOptions: CookieOptions = { ...baseOptions, path: AUTH_BASE_PATH }

export function setAuthCookies(res: Response, { authToken, refreshToken }: AuthTokens): Response {
    return res
        .cookie(ACCESS_COOKIE, authToken, { ...accessOptions, maxAge: TOKEN_TTL_SECONDS.access * MS_PER_SECOND })
        .cookie(REFRESH_COOKIE, refreshToken, { ...refreshOptions, maxAge: TOKEN_TTL_SECONDS.refresh * MS_PER_SECOND })
}

export function clearAuthCookies(res: Response): Response {
    return res.clearCookie(ACCESS_COOKIE, accessOptions).clearCookie(REFRESH_COOKIE, refreshOptions)
}
