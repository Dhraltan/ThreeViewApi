import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { AppRoutes } from "./routes";
import { Request, Response } from "express";
import { ormConfig } from "./ormconfig";
import "dotenv/config";
import errorMiddleware from "./middlewares/exceptions/error.middleware";

const app = express();
const port = process.env.SERVER_PORT;

app.use(express.json());

app.use("*", async (req, res, next) => {
  res.setHeader("access-control-allow-origin", "*");
  next();
});

async function init() {
  await createConnection(ormConfig);

  AppRoutes.forEach(async (route) => {
    (app as any)[route.method](
      route.route,
      async (request: Request, response: Response, next: Function) => {
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
