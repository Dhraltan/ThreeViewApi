import { NextFunction, Request, Response } from "express";
import { Client } from "@elastic/elasticsearch";

export class ElasticController {
  private client = new Client({
    node: "https://8f9677360fc34e2eb943d737b2597c7b.us-east-1.aws.found.io",
    auth: {
      password: "AWbtmGda2Q7BI2bYpdjyF4qd",
      username: "elastic",
    },
  });

  getIndexInfo = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const res = await this.client.search({
        index: "test.1_2021-06-03",
        size: 1000
      });
      response.status(200).send(res.body);
    } catch (error) {
      response.status(500).send(error);
    }
  };
}
