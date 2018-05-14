import * as Axios from 'axios';
import {
  lensPath,
  set,
} from 'ramda';

export function genAxiosConfig(params: any, filter?: any) {
  const config: Axios.AxiosRequestConfig = {};
  config.params = params && params;
  config.headers = filter && { 'X-Filter': JSON.stringify(filter) };
  return config;
}

const L = {
  url: lensPath(['url']),
  method: lensPath(['method']),
  params: lensPath(['params']),
  data: lensPath(['data']),
  xFilter: lensPath(['headers', 'x-filter']),
};

/** URL */
export const setURL = (url: string) => set(L.url, url);

/** METHOD */
export const setMethod = (method: 'GET' | 'POST' | 'PUT' | 'DELETE') => set(L.method, method);

/** Param */
export const setParams = (params: any) => set(L.params, params);

/** Data */
export const setData = (data: any) => set(L.data, data);

/** X-Filter */
export const setXFilter = (xFilter: any) => set(L.xFilter, () => JSON.stringify(xFilter));

/** Generator */
export default (...fns: Function[]) => {
  const config = fns.reverse().reduce((result, currentFn) => currentFn(result), {});
  return Axios.default(config);
};
