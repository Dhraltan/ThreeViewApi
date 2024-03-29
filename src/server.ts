import "reflect-metadata";
import "dotenv/config";
import express from "express";
import errorMiddleware from "./middlewares/exceptions/error.middleware";
import cookieParser from "cookie-parser";
import { createConnection } from "typeorm";
import { ormConfig } from "./ormconfig";
import { userRouter } from "./routers/user.router";
import { authRouter } from "./routers/auth.router";
import { contactRouter } from "./routers/contact.router";
import { elasticRouter } from "./routers/elastic.router";

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

  await app.listen(port);

  app.use(userRouter);
  app.use(contactRouter);
  app.use(authRouter);
  app.use(elasticRouter);
  
  app.use(errorMiddleware);
}

init().then(() => {
  console.log(`Server is listening to port: ${port}`);
});
