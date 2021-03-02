import { UserController } from "./controllers/user/userController";

export const AppRoutes = [
  {
    method: "post",
    route: "/auth",
    controller: UserController,
    action: "register",
  },
  {
    method: "get",
    route: "/auth",
    controller: UserController,
    action: "one",
  },
];
