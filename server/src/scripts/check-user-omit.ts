import assert from "node:assert/strict"
import { prisma } from "../config/db.js"

const FAKE_HASH = "not-a-real-hash"

const user = await prisma.user.create({
    data: { name: "Omit Check", email: `omit-check-${Date.now()}@example.com`, passwordHash: FAKE_HASH },
})

try {
    assert.ok(!("passwordHash" in user), "create() leaked passwordHash")

    const found = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
    assert.ok(!("passwordHash" in found), "findUnique() leaked passwordHash")

    const withHash = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, omit: { passwordHash: false } })
    assert.equal(withHash.passwordHash, FAKE_HASH)

    console.log("OK: passwordHash hidden by default, returned only on explicit opt-in")
} finally {
    await prisma.user.delete({ where: { id: user.id } })
    await prisma.$disconnect()
}
