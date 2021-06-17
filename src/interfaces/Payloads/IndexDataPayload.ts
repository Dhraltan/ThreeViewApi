export interface IndexDataPayload {
  BME680: {
    "temperature[*C]": number;
    "atmospheric_pressure[hPa]": number;
    IAQ: number;
    sIAQ: number;
    "bTVOC[ppm]": number;
    "eCO2[ppm]": number;
    "humidity[%]": number;
  };
  CCS811: {
    "eCO2[ppm]": number;
    "eTVOC[ppb]": number;
  };
  ZH03B: {
    "PM1.0[ug/m3]": number;
    "PM2.5[ug/m3]": number;
    "PM10[ug/m3]": number;
  };
  "Vibration[ms]": number;
}
