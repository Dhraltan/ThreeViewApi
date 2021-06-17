import {NextFunction, request, Request, Response} from "express";
import {Client} from "@elastic/elasticsearch";
import {IndexDataPayload} from "../../interfaces/Payloads/IndexDataPayload";
import {IndexDTO} from "../../interfaces/DTOs/IndexDTO";
import {ElasticSearchOptions} from "../../utils/ElasticSearchOptions";
import {averageDataObject} from "../../utils/averageDataObject";

export class ElasticController {
  private client = new Client({
    node: "https://8f9677360fc34e2eb943d737b2597c7b.us-east-1.aws.found.io",
    auth: {
      password: process.env.ELASTIC_PASSWORD,
      username: process.env.ELASTIC_USERNAME,
    },
  });

  getIndexInfo = async (request: Request, response: Response, next: NextFunction) => {
    let indexParameter: string = "*";
    if (request.body.option == ElasticSearchOptions.LastMeasurement) {
      indexParameter = new Date().toISOString().split("T")[0];
    }
    try {
      const res = await this.client.search({
        index: `aq1.2_${indexParameter}`,
        size: 1000,
        body: this.getElasticBody(request.body),
      });
      response.status(200).send(this.getResponseBody(res.body, request.body.option as string));
    } catch (error) {
      if (error.meta?.statusCode) {
        response.status(error.meta.statusCode).send(error);
      } else {
        response.status(500).send(error);
      }
    }
  };

  private getResponseBody(rawResponse: IndexDTO, option: string) {
    let responseBody = {};
    switch (option) {
      case ElasticSearchOptions.RangeAverage:
        responseBody = this.mapIndexDataFromAverages(rawResponse);
        break;

      case ElasticSearchOptions.LastMeasurement:
        responseBody = this.mapIndexDataFromSource(rawResponse);
        break;

      default:
        break;
    }
    return responseBody;
  }

  private getElasticBody(requestBody: any) {
    let elasticBody = {};

    if (requestBody.option == ElasticSearchOptions.RangeAverage) {
      elasticBody = {
        aggs: {
          filter_data: {
            filter: {
              range: {
                timestamp: {
                  gte: requestBody.startDate,
                  lte: requestBody.endDate,
                },
              },
            },
            aggs: averageDataObject,
          },
        },
      };
    }
    return elasticBody;
  }

  private mapIndexDataFromSource(rawResponse: IndexDTO): IndexDataPayload {
    const res = rawResponse.hits.hits[0]._source;

    const mappedResponse: IndexDataPayload = {
      BME680: res.BME680,
      CCS811: res.CCS811,
      ZH03B: res.ZH03B,
      "Vibration[ms]": res["Vibration[ms]"],
    };
    return mappedResponse;
  }

  private mapIndexDataFromAverages(rawResponse: IndexDTO): IndexDataPayload {
    const res = rawResponse.aggregations.filter_data;

    const mappedResponse: IndexDataPayload = {
      BME680: {
        "atmospheric_pressure[hPa]": parseFloat(res.avg_atm.value.toFixed(2)),
        "temperature[*C]": parseFloat(res.avg_temp.value.toFixed(2)),
        IAQ: parseFloat(res.avg_iaq.value.toFixed(2)),
        "bTVOC[ppm]": parseFloat(res.avg_bmetvoc.value.toFixed(2)),
        "eCO2[ppm]": parseFloat(res.avg_bmeeco2.value.toFixed(2)),
        sIAQ: parseFloat(res.avg_siaq.value.toFixed(2)),
        "humidity[%]": parseFloat(res.avg_humidity.value.toFixed(2)),
      },
      CCS811: {
        "eTVOC[ppb]": parseFloat(res.avg_ccstvoc.value.toFixed(2)),
        "eCO2[ppm]": parseFloat(res.avg_ccseco2.value.toFixed(2)),
      },
      ZH03B: {
        "PM1.0[ug/m3]": parseFloat(res.avg_pm1.value.toFixed(2)),
        "PM2.5[ug/m3]": parseFloat(res["avg_pm2.5"].value.toFixed(2)),
        "PM10[ug/m3]": parseFloat(res.avg_pm10.value.toFixed(2)),
      },
      "Vibration[ms]": parseFloat(res.avg_vibrations.value.toFixed(2)),
    };
    return mappedResponse;
  }
}
