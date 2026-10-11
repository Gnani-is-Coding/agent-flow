import type { NextFunction, Request, RequestHandler, Response } from "express"
import { HttpError } from "../helpers/errorHelpers.js"
import type { Role } from "../generated/prisma/enums.js"

// use after `auth`, which sets req.user
export function requireRole(...roles: Role[]): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) throw new HttpError(401, "Not authenticated")
        if (!roles.includes(req.user.role)) throw new HttpError(403, "Forbidden")
        next()
    }
}
