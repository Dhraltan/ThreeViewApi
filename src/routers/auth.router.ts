import express from "express";
import { AuthController } from "../controllers/user/authController";

const authRouter = express.Router();
const path = "/api/auth";
const authController = new AuthController();

authRouter.post(`${path}/register`, authController.register);
authRouter.post(`${path}/changePassword`, authController.changePassword);
authRouter.post(`${path}/login`, authController.login);
authRouter.get(`${path}/logout`, authController.logout);

export { authRouter };
