import { Router } from "express";
import { json } from "body-parser";
import { AuthController } from "controllers/rest";

const AuthRouter = Router()
AuthRouter.use(json())

AuthRouter.post("/login", AuthController.login)
AuthRouter.post("/verifyToken", AuthController.verifyToken)

export default AuthRouter
