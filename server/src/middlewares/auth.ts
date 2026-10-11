import type { NextFunction, Response, Request } from "express"
import { HttpError } from "../helpers/errorHelpers.js"
import { verifyToken } from "../helpers/tokens.js"
import { ACCESS_COOKIE } from "../helpers/authCookies.js"
import type { AuthUser } from "../types/auth.types.js"

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser
        }
    }
}

// access token only; an expired one gets a 401 and the client calls /rotate
export function auth(req: Request, _res: Response, next: NextFunction): void {
    const token: unknown = req.cookies?.[ACCESS_COOKIE]
    if (typeof token !== "string") throw new HttpError(401, "Not authenticated")

    req.user = verifyToken(token, "access")
    next()
}
