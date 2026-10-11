import type { Request, Response } from "express"
import { Services } from "../services/index.js"
import { HttpError } from "../helpers/errorHelpers.js"
import { clearAuthCookies, REFRESH_COOKIE, setAuthCookies } from "../helpers/authCookies.js"

async function register(req: Request, res: Response): Promise<void> {
    const { user, ...tokens } = await Services.auth.register(req.body)
    setAuthCookies(res, tokens).status(201).send({ success: true, data: { user } })
}

async function login(req: Request, res: Response): Promise<void> {
    const { user, ...tokens } = await Services.auth.login(req.body)
    setAuthCookies(res, tokens).status(200).send({ success: true, data: { user } })
}

async function me(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new HttpError(401, "Unauthorised")
    const user = await Services.auth.me(req.user.id)
    res.status(200).send({ success: true, data: { user } })
}

async function rotate(req: Request, res: Response): Promise<void> {
    const refreshToken: unknown = req.cookies?.[REFRESH_COOKIE]
    if (typeof refreshToken !== "string") throw new HttpError(401, "Session expired, login again")

    const { user, ...tokens } = await Services.auth.rotate(refreshToken)
    setAuthCookies(res, tokens).status(200).send({ success: true, data: { user } })
}

function logout(_req: Request, res: Response): void {
    clearAuthCookies(res).status(204).end()
}

export const AuthController = {
    register,
    login,
    me,
    rotate,
    logout,
}
