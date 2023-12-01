import axios, { AxiosRequestConfig } from 'axios';
import { DateTime } from 'luxon';

  export const getBaseRequest = (linodeId: number) => {
    const config: AxiosRequestConfig = {
      baseURL: `https://api.linodetelemetry.obcolint.armada-dev.akam.ai/VM/${linodeId}/metrics`,
      method: 'GET'
    };
    return config;
  }
  
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
    end: number,linodeId: number, token: string|null) => {
      const granularity = calculateGranularity(start,end);
      const timespan = formatTimeSpan(start,end);
      const baseRequest: AxiosRequestConfig = getBaseRequest(linodeId);
      baseRequest.headers = {
        'Authorization': `${token}`
      }
      baseRequest.params = {
        metricname: metricName,
        timespan: timespan,
        granularity: granularity,
        // filter: `state='buffered'`,
        // aggregation: `max`,
        // groupby: `stack_telemetry`,
        // limit: `5`,
        // orderby: `5,desc` 
      };
      return axios
        .request(baseRequest)
        .then(res => {
          return (Promise.resolve(res));
        })
  };

  export const testCors = () => {
    const config: AxiosRequestConfig = {
      // baseURL: `https://cloud.dev.linode.com/api/v4/linode/instances`,
      baseURL: `https://api.dev.linode.com/v4/linode/instances`,
      method: 'GET'
    };
    config.headers = {
      'Authorization': 'Bearer c14dbaaf1e598cae518fcdf05cf8051cee97e50d8bc8bded3498a194e08f7b33'
    }
    return axios
        .request(config)
        .then(res => {
          return (Promise.resolve(res));
        });
  }