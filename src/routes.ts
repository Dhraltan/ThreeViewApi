import { AuthController } from "./controllers/user/authController";
import { UserController } from "./controllers/user/userController";
import tokenMiddleware from "./middlewares/tokenAuth/token.middleware";

export const AppRoutes = [
  {
    method: "post",
    route: "/auth/register",
    controller: AuthController,
    action: "register",
  },
  {
    method: "post",
    route: "/auth/login",
    controller: AuthController,
    action: "login",
  },
  {
    method: "get",
    route: "/user",
    controller: UserController,
    action: "getUserInfo",
    middleware: tokenMiddleware
  },
];
