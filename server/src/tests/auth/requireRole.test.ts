import { describe, expect, it, vi } from "vitest"
import type { Request, Response } from "express"
import { requireRole } from "../../middlewares/requireRole.js"
import type { AuthUser } from "../../types/auth.types.js"

const run = (user: AuthUser | undefined): ReturnType<typeof vi.fn> => {
    const next = vi.fn()
    requireRole("ADMIN")({ user } as Request, {} as Response, next)
    return next
}

describe("requireRole", () => {
    it("lets an allowed role through", () => {
        expect(run({ id: "1", role: "ADMIN" })).toHaveBeenCalledOnce()
    })

    it("returns 403 for a role that is not allowed", () => {
        expect(() => run({ id: "1", role: "OPERATOR" })).toThrow(expect.objectContaining({ status: 403 }))
    })

    it("returns 401 when auth did not run", () => {
        expect(() => run(undefined)).toThrow(expect.objectContaining({ status: 401 }))
    })
})
