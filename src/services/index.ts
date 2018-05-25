import * as Axios from 'axios';
import { compose, isEmpty, lensPath, not, omit, set, when } from 'ramda';
import { validate, Schema } from 'joi';

interface RequestConfig extends Axios.AxiosRequestConfig {
  validationErrors?: { field?: string, response: string }[];
}

const L = {
  url: lensPath(['url']),
  method: lensPath(['method']),
  params: lensPath(['params']),
  data: lensPath(['data']),
  xFilter: lensPath(['headers', 'X-Filter']),
  validationErrors: lensPath(['validationErrors']),
};

const isNotEmpty = compose(not, isEmpty);

/** URL */
export const setURL = (url: string) => set(L.url, url);

/** METHOD */
export const setMethod = (method: 'GET' | 'POST' | 'PUT' | 'DELETE') => set(L.method, method);

/** Param */
export const setParams = (params: any = {}) => when(
  () => isNotEmpty(params),
  set(L.params, params),
);

/** Data */
export const setData = (data: any) => set(L.data, data);

/** X-Filter */
export const setXFilter = (xFilter: any) => when(
  () => isNotEmpty(xFilter),
  set(L.xFilter, JSON.stringify(xFilter)),
);

export const validateRequestData = (data: any, schema: Schema) =>
  (config: RequestConfig) => {
    const { error } = validate(data, schema);

    return error
      ? set(L.validationErrors, error.details.map(d => d.message), config)
      : config;
  };

/** Generator */
export default <T>(...fns: Function[]): Axios.AxiosPromise<T> => {
  const config = fns.reverse().reduce((result, currentFn) => currentFn(result), {});
  if (config.validationErrors) {
    return Promise.reject({
      config: omit(['validationErrors'], config),
      response: { data: { errors: config.validationErrors } },
    });
  }

  return Axios.default(config);
};
