import {NextFunction, request, Request, Response} from "express";
import {Client} from "@elastic/elasticsearch";
import {IndexDataPayload} from "../../interfaces/Payloads/IndexDataPayload";
import {IndexDTO} from "../../interfaces/DTOs/IndexDTO";
import {ElasticSearchOptions} from "../../utils/ElasticSearchOptions";
import {averageDataObject} from "../../utils/averageDataObject";
import {warningLimits} from "../../utils/warningLimits";
import {ContactController} from "../contact/contactController";

export class ElasticController {
  private wasWarningSentRecently: boolean = false;
  private contactController = new ContactController();
  private client = new Client({
    node: "https://8f9677360fc34e2eb943d737b2597c7b.us-east-1.aws.found.io",
    auth: {
      password: process.env.ELASTIC_PASSWORD,
      username: process.env.ELASTIC_USERNAME,
    },
  });

  getIndexInfo = async (request: Request, response: Response, next: NextFunction) => {
    let indexDate: string = "*";
    let indexRoom: string = request.body.room;
    if (request.body.option == ElasticSearchOptions.LastMeasurement) {
      indexDate = new Date().toISOString().split("T")[0];
    }
    try {
      const res = await this.client.search({
        index: `${indexRoom}_${indexDate}`,
        size: 1000,
        body: this.getElasticBody(request.body),
      });
      const modeledResponse = this.getResponseBody(res.body, request.body.option as string);
      if (
        !this.wasWarningSentRecently &&
        request.body.option == ElasticSearchOptions.LastMeasurement
      )
        this.searchForWarning(modeledResponse);
      response.status(200).send(modeledResponse);
    } catch (error) {
      if (error.meta?.statusCode) {
        response.status(error.meta.statusCode).send(error);
      } else {
        response.status(500).send(error);
      }
    }
  };

  private searchForWarning = (data: IndexDataPayload) => {
    let isWarningFound: boolean = false;
    const warningValues: {sensor: string; value: number}[] = [];

    if (data.BME680.IAQ > warningLimits.iaq.highLimit) {
      isWarningFound = true;
      warningValues.push({sensor: "IAQ", value: data.BME680.IAQ});
    }
    if (
      data.BME680["atmospheric_pressure[hPa]"] > warningLimits.atmosferic.highLimit ||
      data.BME680["atmospheric_pressure[hPa]"] < warningLimits.atmosferic.lowLimit
    ) {
      isWarningFound = true;
      warningValues.push({
        sensor: "atmospheric_pressure[hPa]",
        value: data.BME680["atmospheric_pressure[hPa]"],
      });
    }
    if (data.BME680["bTVOC[ppm]"] > warningLimits.bmeTVOC.highLimit) {
      isWarningFound = true;
      warningValues.push({sensor: "bTVOC[ppm]", value: data.BME680["bTVOC[ppm]"]});
    }
    if (data.BME680["eCO2[ppm]"] > warningLimits.ECO2.highLimit) {
      isWarningFound = true;
      warningValues.push({sensor: "eCO2[ppm]", value: data.BME680["eCO2[ppm]"]});
    }
    if (
      data.BME680["humidity[%]"] > warningLimits.humidity.highLimit ||
      data.BME680["humidity[%]"] < warningLimits.humidity.lowLimit
    ) {
      isWarningFound = true;
      warningValues.push({sensor: "humidity[%]", value: data.BME680["humidity[%]"]});
    }
    if (data.BME680.sIAQ > warningLimits.siaq.highLimit) {
      isWarningFound = true;
      warningValues.push({sensor: "SIAQ", value: data.BME680.sIAQ});
    }
    if (
      data.BME680["temperature[*C]"] > warningLimits.temperature.highLimit ||
      data.BME680["temperature[*C]"] < warningLimits.temperature.lowLimit
    ) {
      isWarningFound = true;
      warningValues.push({sensor: "temperature[*C]", value: data.BME680["temperature[*C]"]});
    }
    if (data.CCS811["eTVOC[ppb]"] > warningLimits.ccsTVOC.highLimit) {
      isWarningFound = true;
      warningValues.push({sensor: "eTVOC[ppb]", value: data.CCS811["eTVOC[ppb]"]});
    }
    if (data.CCS811["eCO2[ppm]"] > warningLimits.ECO2.highLimit) {
      isWarningFound = true;
      warningValues.push({sensor: "eCO2[ppm]", value: data.CCS811["eCO2[ppm]"]});
    }
    if (data.ZH03B["PM1.0[ug/m3]"] > warningLimits.pm1.highLimit) {
      isWarningFound = true;
      warningValues.push({sensor: "PM1.0[ug/m3]", value: data.ZH03B["PM1.0[ug/m3]"]});
    }
    if (data.ZH03B["PM2.5[ug/m3]"] > warningLimits.pm25.highLimit) {
      isWarningFound = true;
      warningValues.push({sensor: "PM2.5[ug/m3]", value: data.ZH03B["PM2.5[ug/m3]"]});
    }
    if (data.ZH03B["PM10[ug/m3]"] > warningLimits.pm10.highLimit) {
      isWarningFound = true;
      warningValues.push({sensor: "PM10[ug/m3]", value: data.ZH03B["PM10[ug/m3]"]});
    }
    if (data["Vibration[ms]"] > warningLimits.vibrations.highLimit) {
      isWarningFound = true;
      warningValues.push({sensor: "Vibration[ms]", value: data["Vibration[ms]"]});
    }

    if (isWarningFound) {
      this.wasWarningSentRecently = true;
      this.contactController.sendWarningEmail(warningValues);
      setTimeout(() => {
        this.wasWarningSentRecently = false;
      }, 3600000);
    }
  };

  private getResponseBody(rawResponse: IndexDTO, option: string): IndexDataPayload {
    let responseBody: IndexDataPayload = null;
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
