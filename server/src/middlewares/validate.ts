import type { NextFunction, Request, RequestHandler, Response } from "express"
import type { ZodType } from "zod"
import { HttpError } from "../helpers/errorHelpers.js"

export function parseInput<T>(schema: ZodType<T>, input: unknown): T {
    const result = schema.safeParse(input)
    if (!result.success) {
        const issue = result.error.issues[0]
        throw new HttpError(400, issue ? `${issue.path.join(".")}: ${issue.message}` : "Invalid request")
    }
    return result.data
}

export function validate(schema: ZodType): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction): void => {
        req.body = parseInput(schema, req.body)
        next()
    }
}
