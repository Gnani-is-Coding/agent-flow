import { Router } from "express"
import Controllers from "../controllers/index.js"
import { auth } from "../middlewares/auth.js"
import { validate } from "../middlewares/validate.js"
import { credentialsLimiter } from "../middlewares/rateLimit.js"
import { loginSchema, registerSchema } from "../types/auth.types.js"

const AuthRouter = Router()

AuthRouter.post("/register", credentialsLimiter, validate(registerSchema), Controllers.AuthController.register)

AuthRouter.post("/login", credentialsLimiter, validate(loginSchema), Controllers.AuthController.login)

AuthRouter.get("/me", auth, Controllers.AuthController.me)

AuthRouter.post("/rotate", Controllers.AuthController.rotate)

AuthRouter.post("/logout", Controllers.AuthController.logout)

export default AuthRouter
