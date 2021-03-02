import { AuthController } from "./controllers/user/authController";
import { UserController } from "./controllers/user/userController";
import tokenMiddleware from "./middlewares/tokenAuth/token.middleware";

export const AppRoutes = [
  {
    method: "post",
    route: "/api/auth/register",
    controller: AuthController,
    action: "register",
  },
  {
    method: "post",
    route: "/api/auth/login",
    controller: AuthController,
    action: "login",
  },
  {
    method: "get",
    route: "/api/auth/logout",
    controller: AuthController,
    action: "logout",
  },
  {
    method: "get",
    route: "/api/user",
    controller: UserController,
    action: "getUserInfo",
    middleware: tokenMiddleware
  },
];
