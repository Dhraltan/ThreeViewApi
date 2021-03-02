import express from "express";
import { UserController } from "../controllers/user/userController";
import tokenMiddleware from "../middlewares/tokenAuth/token.middleware";

const router = express.Router();
const path = "/api/user";
const userController = new UserController();

router.get(path, tokenMiddleware, userController.getUserInfo);

export { router };
