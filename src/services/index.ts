import * as Axios from 'axios';
import { validate, Schema } from 'joi';
import {
  compose,
  isEmpty,
  isNil,
  lensPath,
  lensProp,
  not,
  omit,
  path,
  pathOr,
  set,
  tap,
  when,
} from 'ramda';
import * as Raven from 'raven-js';

const errorsMap: { [index: string]: string } = {
  region_any_required: 'A region is required.',
};

const getErrorReason = compose(

  pathOr('Please check your data and try again.', ['result']),

  tap(({ key, result }) => {
    if (result) {
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      /* tslint:disable-next-line */
      return console.warn(`Unhandled validation error for ${key}.`);
    }

    Raven.captureException('Unhandled validation error', { extra: { key } });
  }),

  (obj: { key: string }) => set(lensProp('result'), path([obj.key], errorsMap), obj),

  (key: string) => ({ key }),
);

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

const isNotEmpty = compose(not, v => isEmpty(v) || isNil(v));

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
      ? set(L.validationErrors, error.details.map((detail) => {
        const path = detail.path.join('_');
        const type = detail.type.replace('.', '_');
        return {
          field: path,
          reason: getErrorReason(`${path}_${type}`),
        };
      }), config)
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
