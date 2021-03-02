import express from "express";
import { AuthController } from "../controllers/user/authController";

const router = express.Router();
const path = "/api/auth";
const authController = new AuthController();

router.post(`${path}/register`, authController.register);
router.post(`${path}/login`, authController.login);
router.get(`${path}/logout`, authController.logout);

export { router };
