import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { AppRoutes } from "./routes";
import { Request, Response } from "express";

const app = express();
const port = 3000;

app.use(express.json());

app.use("*", async (req, res, next) => {
  res.setHeader("access-control-allow-origin", "*");
  next();
});

async function init() {
  await createConnection();

  AppRoutes.forEach((route) => {
    (app as any)[route.method](
      route.route,
      (request: Request, response: Response, next: Function) => {
        (new route.controller() as any)
          [route.action](request, response)
          .then(() => next)
          .catch((err: any) => next(err));
      }
    );
  });

  await app.listen(port);
}

init().then(() => {
  console.log(`Server is listening to port: ${port}`);
});
