import express from "express";
import tokenMiddleware from "../middlewares/tokenAuth/token.middleware";
import { AuthController } from "../controllers/user/authController";

const authRouter = express.Router();
const path = "/api/auth";
const authController = new AuthController();

authRouter.post(`${path}/register`, tokenMiddleware, authController.register);
authRouter.post(`${path}/changePassword`, tokenMiddleware, authController.changePassword);
authRouter.post(`${path}/login`, authController.login);
authRouter.get(`${path}/logout`, authController.logout);

export { authRouter };
