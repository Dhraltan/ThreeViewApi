import { UserController } from "./controllers/user/userController";

export const AppRoutes = [
  {
    method: "post",
    route: "/users",
    controller: UserController,
    action: "save",
  },
  {
    method: "get",
    route: "/users",
    controller: UserController,
    action: "one",
  },
];
