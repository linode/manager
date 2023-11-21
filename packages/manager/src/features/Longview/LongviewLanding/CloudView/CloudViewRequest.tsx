import axios, { AxiosRequestConfig } from 'axios';
import { DateTime } from 'luxon';

  export const baseRequest: AxiosRequestConfig = {
      baseURL: "https://api.linodetelemetry.obcolint.armada-dev.akam.ai/VM/51259986/metrics",
      headers: {
        'Authorization': 'APIKey 2F3AF7AB-900E-43DE-8BFD775FFF5BF566'
      },
      method: 'GET'
  };
  
  export const calculateGranularity = (startTime: number, 
    endTime: number) => {
      const timeDifference = endTime - startTime;
      switch (timeDifference) {
        case 1800:
          return '1m';
        case 43200:
          return '1m';
        case 86400:
          return '1m';
        case 604800:
          return '5m';
        case 2592000:
          return '2h';
        default:
          return '1d';
      }
    }

  export const formatTimeSpan = (startTime: number, 
    endTime: number) => {
      return (DateTime.fromSeconds(startTime).toUTC().toISO())
      .slice(0,-2) + 'Z' + '/' + (DateTime.fromSeconds(endTime)
      .toUTC().toISO()).slice(0,-2) + 'Z';
    }

  export const getMetrics = (metricName: string, start: number, 
    end: number) => {
      const granularity = calculateGranularity(start,end);
      const timespan = formatTimeSpan(start,end);
      baseRequest.params = {
        metricname: metricName,
        timespan: timespan,
        granularity: granularity,
        // filter: `state='buffered'`,
        // aggregation: `max`,
        // groupby: `stack_telemetry`,
        // limit: `5`,
        // orderby: `5,desc` 
      }
      return axios
        .request(baseRequest)
        .then(res => {
          return (Promise.resolve(res));
        })
  };