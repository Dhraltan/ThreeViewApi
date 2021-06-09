import express from "express";
import { ElasticController } from "../controllers/elastic/ElasticController";

const elasticRouter = express.Router();
const path = "/api/elastic";
const contactController = new ElasticController();

elasticRouter.get(`${path}`, contactController.getIndexInfo);

export { elasticRouter };
