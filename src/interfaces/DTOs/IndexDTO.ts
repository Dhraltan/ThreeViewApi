import {HitDTO} from "./HitDTO";

export interface IndexDTO {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {value: number; relation: string};
    max_score: number;
    hits: HitDTO[];
  };
  aggregations: {
    filter_data: {
      avg_ccstvoc: {
        value: number;
      };
      avg_ccseco2: {
        value: number;
      };
      avg_bmetvoc: {
        value: number;
      };
      avg_temp: {
        value: number;
      };
      avg_humidity: {
        value: number;
      };
      avg_bmeeco2: {
        value: number;
      };
      avg_siaq: {
        value: number;
      };
      avg_pm1: {
        value: number;
      };
      avg_pm10: {
        value: number;
      };
      avg_vibrations: {
        value: number;
      };
      "avg_pm2.5": {
        value: number;
      };
      avg_iaq: {
        value: number;
      };
      avg_atm: {
        value: number;
      };
    };
  };
}
