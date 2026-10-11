import bcrypt from "bcryptjs"
import { prisma } from "../config/db.js"
import { HttpError } from "../helpers/errorHelpers.js"
import { signToken, verifyToken } from "../helpers/tokens.js"
import { Prisma } from "../generated/prisma/client.js"
import type { AuthResult, AuthTokens, AuthUser, LoginPayload, PublicUser, RegisterPayload } from "../types/auth.types.js"

const BCRYPT_COST = 12
const UNIQUE_VIOLATION = "P2002"
const INVALID_CREDENTIALS = "Invalid email or password"
// compared against when the email is unknown, so both login failures take the same time
const DUMMY_HASH = bcrypt.hashSync("dummy-password", BCRYPT_COST)

function issueTokens(user: AuthUser): AuthTokens {
    return { authToken: signToken(user, "access"), refreshToken: signToken(user, "refresh") }
}

// onboard admins, just like "operators", for Admins, can upgrade the ROLE later
async function register({ name, email, password }: RegisterPayload): Promise<AuthResult> {
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST)
    try {
        const user = await prisma.user.create({ data: { name, email, passwordHash } })
        return { ...issueTokens(user), user }
    } catch (e: unknown) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === UNIQUE_VIOLATION) {
            throw new HttpError(409, "Email already registered")
        }
        throw e
    }
}

async function login({ email, password }: LoginPayload): Promise<AuthResult> {
    const found = await prisma.user.findUnique({ where: { email }, omit: { passwordHash: false } })
    const isValid = await bcrypt.compare(password, found?.passwordHash ?? DUMMY_HASH)
    if (!found || !isValid) throw new HttpError(401, INVALID_CREDENTIALS)

    const user = await prisma.user.update({ where: { id: found.id }, data: { lastLoginAt: new Date() } })
    return { ...issueTokens(user), user }
}

async function me(id: string): Promise<PublicUser> {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new HttpError(401, "User no longer exists")
    return user
}

// reloads the user so a changed role or deleted account takes effect on the next rotate
async function rotate(refreshToken: string): Promise<AuthResult> {
    const { id } = verifyToken(refreshToken, "refresh")
    const user = await me(id)
    return { ...issueTokens(user), user }
}

export const auth = {
    register,
    login,
    me,
    rotate,
}
