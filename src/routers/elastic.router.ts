import express from "express";
import tokenMiddleware from "../middlewares/tokenAuth/token.middleware";
import { ElasticController } from "../controllers/elastic/ElasticController";

const elasticRouter = express.Router();
const path = "/api/elastic";
const contactController = new ElasticController();

elasticRouter.post(`${path}`, tokenMiddleware, contactController.getIndexInfo);

export { elasticRouter };
