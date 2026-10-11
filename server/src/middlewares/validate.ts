import type { NextFunction, Request, RequestHandler, Response } from "express"
import type { ZodType } from "zod"
import { HttpError } from "../helpers/errorHelpers.js"

export function validate(schema: ZodType): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body)
        if (!result.success) {
            const issue = result.error.issues[0]
            throw new HttpError(400, issue ? `${issue.path.join(".")}: ${issue.message}` : "Invalid request body")
        }
        req.body = result.data
        next()
    }
}
