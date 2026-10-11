import type { NextFunction, Request, Response } from "express"

const INTERNAL_ERROR = 500

function getStatus(err: unknown): number {
    if (typeof err !== "object" || err === null) return INTERNAL_ERROR
    const { status, statusCode } = err as { status?: unknown; statusCode?: unknown }
    const code = status ?? statusCode
    return typeof code === "number" && code >= 400 && code < 600 ? code : INTERNAL_ERROR
}

// Express detects error middleware by its 4 params, so `next` must stay even if unused
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
    if (res.headersSent) return next(err) // let the express default handler close the connection.

    const status = getStatus(err)
    console.error(`[${req.method} ${req.originalUrl}]`, err)

    const message = status < INTERNAL_ERROR && err instanceof Error ? err.message : "Something went wrong, try again"
    res.status(status).send({ success: false, message })
}
