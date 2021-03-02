import { UserController } from "./controllers/user/userController";

export const AppRoutes = [
  {
    method: "post",
    route: "/auth/register",
    controller: UserController,
    action: "register",
  },
  {
    method: "post",
    route: "/auth/login",
    controller: UserController,
    action: "login",
  },
];
