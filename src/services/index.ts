import * as Axios from 'axios';
import {
  compose,
  isEmpty,
  isNil,
  lensPath,
  not,
  omit,
  set,
  when,
} from 'ramda';
import { ObjectSchema, ValidationError } from 'yup';

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
export const setData = <T>(data: T, schema?: ObjectSchema<T>) => {
  if (!schema) {
    return set(L.data, data);
  }

  try {
    schema.validateSync(data, { abortEarly: false });
    return set(L.data, data);
  } catch (error) {
    return compose(
      set(L.data, data),
      set(L.validationErrors, convertYupToLinodeErrors(error)),
    );
  }
};

const convertYupToLinodeErrors = (validationError: ValidationError): Linode.ApiFieldError[] => {
  const { inner } = validationError;

  /** If aggregate errors */
  if (inner && inner.length > 0) {
    return inner.reduce((result, innerValidationError) => {
      const err = convertYupToLinodeErrors(innerValidationError);
      return Array.isArray(err)
        ? [...result, ...err]
        : [...result, err]
    }, []);
  }

  return [mapYupToLinodeAPIError(validationError)]
};

const mapYupToLinodeAPIError = ({ message, path }: ValidationError): Linode.ApiFieldError => ({
  reason: message,
  ...(path && { field: path }),
})

/** X-Filter */
export const setXFilter = (xFilter: any) => when(
  () => isNotEmpty(xFilter),
  set(L.xFilter, JSON.stringify(xFilter)),
);

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

/**
 * Mock Error Function
 *
 * Use this function in place of your API request to mock errors. This returns the same
 * same response body as an Axios error.
 *
 * @example getLinodes = () => mockAPIError();
 * @example getLinode = () => mockAPIError(404, 'Not Found');
 * @example getLinodes = () => mockAPIError(404, 'Not Found');
 */
export const mockAPIError = (
  status: number = 400,
  statusText: string = 'Internal Server Error',
  data: any = {},
): Promise<Axios.AxiosError> =>
  new Promise((resolve, reject) => setTimeout(() => reject(
    createError(
      `Request failed with a status of ${status}`,
      { data, status, statusText, headers: {}, config: {} },
    )
  ), process.env.NODE_ENV === 'test' ? 0 : 250));

const createError = (message: string, response: Axios.AxiosResponse) => {
  const error = new Error(message) as any;
  error.response = response;
  return error;
};

/**
 *
 * Helper method to easily generate APIFieldError[] for a number of fields and a general error.
 */
export const mockAPIFieldErrors = (fields: string[]): Linode.ApiFieldError[] => {
  return fields.reduce(
    (result, field) => [...result, { field, reason: `${field} is incorrect.`, }],
    [{ reason: 'A general error has occured.' }],
  );
};
