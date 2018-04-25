import * as Axios from 'axios';

export function genAxiosConfig(params: any, filter?: any) {
  const config: Axios.AxiosRequestConfig = {};
  config.params = params && params;
  config.headers = filter && { 'X-Filter': JSON.stringify(filter) };
  return config;
}
