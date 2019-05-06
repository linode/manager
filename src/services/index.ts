import Axios, { AxiosError, AxiosPromise, AxiosResponse } from 'axios';
import {
  compose,
  isEmpty,
  isNil,
  lensPath,
  not,
  omit,
  pathOr,
  set,
  when
} from 'ramda';
import { ObjectSchema, ValidationError } from 'yup';

const L = {
  url: lensPath(['url']),
  method: lensPath(['method']),
  params: lensPath(['params']),
  data: lensPath(['data']),
  xFilter: lensPath(['headers', 'X-Filter']),
  validationErrors: lensPath(['validationErrors']),
  headers: lensPath(['headers'])
};

const isNotEmpty = compose(
  not,
  (v: any) => isEmpty(v) || isNil(v)
);

/** URL */
export const setURL = (url: string) => set(L.url, url);

/** METHOD */
export const setMethod = (method: 'GET' | 'POST' | 'PUT' | 'DELETE') =>
  set(L.method, method);

/** Param */
export const setParams = (params: any = {}) =>
  when(() => isNotEmpty(params), set(L.params, params));

export const setHeaders = (headers: any = {}) =>
  when(() => isNotEmpty(headers), set(L.headers, headers));

/**
 * Validate and set data in the request configuration object.
 */
export const setData = <T>(
  data: T,
  /**
   * If a schema is provided, execute its validate method. If the validation fails, the
   * errors will be set at L.validationError's path.
   */
  schema?: ObjectSchema<T>,
  /**
   * postValidationTransform will be applied to the data just before it's set on the configuration
   * object, after the validation has happened. Use with caution: It was created as a trap door for
   * merging IPv4 addresses and ports in the NodeBalancer creation flow.
   */
  postValidationTransform?: (v: any) => any
) => {
  if (!schema) {
    return set(L.data, data);
  }

  const updatedData =
    typeof postValidationTransform === 'function'
      ? postValidationTransform(data)
      : data;

  try {
    schema.validateSync(data, { abortEarly: false });
    return set(L.data, updatedData);
  } catch (error) {
    return compose(
      set(L.data, updatedData),
      set(L.validationErrors, convertYupToLinodeErrors(error))
    );
  }
};

/**
 * Attempt to convert a Yup error to our pattern. The only magic here is the recursive call
 * to itself since we have nested structures (think NodeBalacners).
 */
const convertYupToLinodeErrors = (
  validationError: ValidationError
): Linode.ApiFieldError[] => {
  const { inner } = validationError;

  /** If aggregate errors */
  if (inner && inner.length > 0) {
    return inner.reduce((result, innerValidationError) => {
      const err = convertYupToLinodeErrors(innerValidationError);
      return Array.isArray(err) ? [...result, ...err] : [...result, err];
    }, []);
  }

  /** If single error.  */
  return [mapYupToLinodeAPIError(validationError)];
};

const mapYupToLinodeAPIError = ({
  message,
  path
}: ValidationError): Linode.ApiFieldError => ({
  reason: message,
  ...(path && { field: path })
});

/** X-Filter */
export const setXFilter = (xFilter: any) =>
  when(() => isNotEmpty(xFilter), set(L.xFilter, JSON.stringify(xFilter)));

const reduceRequestConfig = (...fns: Function[]) =>
  fns.reduceRight((result, fn) => fn(result), {});

/** Generator */
export default <T>(...fns: Function[]): AxiosPromise<T> => {
  const config = reduceRequestConfig(...fns);
  if (config.validationErrors) {
    return Promise.reject({
      config: omit(['validationErrors'], config),
      response: { data: { errors: config.validationErrors } }
    });
  }

  return Axios(config).catch(err => {
    const defaultError = [{ reason: 'An unexpected error occurred.' }];
    return Promise.reject(
      pathOr<Linode.ApiFieldError[]>(
        defaultError,
        ['response', 'data', 'errors'],
        err
      )
    );
  });

  /*
   * If in the future, we want to hook into every single
   * async action for the purpose of sending the request data
   * to Google Tag Manager, we can uncomment out the following
   * .then() and .catch() on return Axios(config)
   */

  // .then(response => {
  //   /*
  //    * This is sending an event to the Google Tag Manager
  //    * data layer. This is important because it lets us track
  //    * async actions as custom events
  //    */
  //   if ((window as any).dataLayer) {
  //     (window as any).dataLayer = (window as any).dataLayer || [];
  //     (window as any).dataLayer.push({
  //       'event': 'asyncActionSuccess',
  //       'url': response.config.url,
  //       'method': response.config.method,
  //     });
  //   };
  //   return response;
  // })
  // .catch(e => {
  //   /*
  //    * This is sending an event to the Google Tag Manager
  //    * data layer. This is important because it lets us track
  //    * async actions as custom events
  //    */
  //   if ((window as any).dataLayer) {
  //     (window as any).dataLayer = (window as any).dataLayer || [];
  //     (window as any).dataLayer.push({
  //       'event': 'asyncActionFailure',
  //       'url': e.response.config.url,
  //       'method': e.response.config.method,
  //     });
  //   };
  //   return Promise.reject(e);
  // });
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
  data: any = {}
): Promise<AxiosError> =>
  new Promise((resolve, reject) =>
    setTimeout(
      () =>
        reject(
          createError(`Request failed with a status of ${status}`, {
            data,
            status,
            statusText,
            headers: {},
            config: {}
          })
        ),
      process.env.NODE_ENV === 'test' ? 0 : 250
    )
  );

const createError = (message: string, response: AxiosResponse) => {
  const error = new Error(message) as any;
  error.response = response;
  return error;
};

/**
 *
 * Helper method to easily generate APIFieldError[] for a number of fields and a general error.
 */
export const mockAPIFieldErrors = (
  fields: string[]
): Linode.ApiFieldError[] => {
  return fields.reduce(
    (result, field) => [...result, { field, reason: `${field} is incorrect.` }],
    [{ reason: 'A general error has occurred.' }]
  );
};

/**
 * POC * POC * POC * POC * POC * POC * POC *
 */
interface CancellableRequest<T> {
  request: () => Promise<T>;
  cancel: () => void;
}

export const CancellableRequest = <T>(
  ...fns: Function[]
): CancellableRequest<T> => {
  const config = reduceRequestConfig(...fns);
  const source = Axios.CancelToken.source();

  if (config.validationErrors) {
    return {
      cancel: () => null,
      request: () =>
        Promise.reject({
          config: omit(['validationErrors'], config),
          response: { data: { errors: config.validationErrors } }
        })
    };
  }

  return {
    cancel: source.cancel,
    request: () =>
      Axios({ ...config, cancelToken: source.token })
        .then(response => response.data)
        .catch(err => {
          const defaultError = [{ reason: 'An unexpected error occurred.' }];
          return Promise.reject(
            pathOr(defaultError, ['response', 'data', 'errors'], err)
          );
        })
  };
};
