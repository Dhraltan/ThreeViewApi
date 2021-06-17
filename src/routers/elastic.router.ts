import express from "express";
import { ElasticController } from "../controllers/elastic/ElasticController";

const elasticRouter = express.Router();
const path = "/api/elastic";
const contactController = new ElasticController();

elasticRouter.post(`${path}`, contactController.getIndexInfo);

export { elasticRouter };
