import "reflect-metadata";
import "dotenv/config";
import express from "express";
import errorMiddleware from "./middlewares/exceptions/error.middleware";
import cookieParser from "cookie-parser";
import { createConnection } from "typeorm";
import { AppRoutes } from "./routes";
import { Request, Response } from "express";
import { ormConfig } from "./ormconfig";
import tokenMiddleware from "./middlewares/tokenAuth/token.middleware";

const app = express();
const port = process.env.SERVER_PORT;

async function init() {
  await createConnection(ormConfig);

  app.use(express.json());
  app.use(cookieParser());

  app.use("*", async (req, res, next) => {
    res.setHeader("access-control-allow-origin", "*");
    next();
  });

  AppRoutes.forEach(async (route) => {
    (app as any)[route.method](
      route.route,
      async (request: Request, response: Response, next: Function) => {
        route.middleware;
        (new route.controller() as any)
          [route.action](request, response)
          .then(() => next)
          .catch((err: any) => next(err));
      }
    );
  });

  app.use(errorMiddleware);

  await app.listen(port);
}

init().then(() => {
  console.log(`Server is listening to port: ${port}`);
});
