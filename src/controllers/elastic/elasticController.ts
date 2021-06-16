import { NextFunction, Request, Response } from "express";
import { Client } from "@elastic/elasticsearch";

export class ElasticController {
  private client = new Client({
    node: "https://8f9677360fc34e2eb943d737b2597c7b.us-east-1.aws.found.io",
    auth: {
      password: process.env.ELASTIC_PASSWORD,
      username: process.env.ELASTIC_USERNAME,
    },
  });

  getIndexInfo = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const res = await this.client.search({
        index: `aq1.2_${request.query.date}`,
        size: 1000
      });
      response.status(200).send(res.body);
    } catch (error) {
      if(error.meta?.statusCode){
        response.status(error.meta.statusCode).send(error);
      }else{
        response.status(500).send(error);
      }
    }
  };
}
