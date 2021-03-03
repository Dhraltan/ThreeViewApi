import express from "express";
import { UserController } from "../controllers/user/userController";
import tokenMiddleware from "../middlewares/tokenAuth/token.middleware";

const userRouter = express.Router();
const path = "/api/user";
const userController = new UserController();

userRouter.get(path, tokenMiddleware, userController.getUserInfo);

export { userRouter };
