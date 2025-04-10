import Axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { ValidationError, AnySchema } from 'yup';
import { APIError, Filter, Params } from './types';

interface RequestConfig extends AxiosRequestConfig {
  validationErrors?: APIError[];
}

type RequestConfigFn = (config: RequestConfig) => RequestConfig;

type ConfigField = 'headers' | 'data' | 'params' | 'method' | 'url';

export const baseRequest = Axios.create({
  baseURL: 'https://api.linode.com/v4',
});

baseRequest.interceptors.request.use((config) => {
  const isRunningInNode = typeof process === 'object';

  if (!isRunningInNode) {
    return config;
  }

  const headers = new AxiosHeaders(config.headers);

  headers.set('User-Agent', 'linodejs');

  return { ...config, headers };
});

/**
 * setToken
 *
 * Helper function to authenticate your requests. Most Linode APIv4 endpoints
 * require an OAuth token or personal access token (PAT) to authenticate.
 *
 * @param token
 */
export const setToken = (token: string) => {
  return baseRequest.interceptors.request.use((config) => {
    const headers = new AxiosHeaders(config.headers);

    headers.set('Authorization', `Bearer ${token}`);

    return { ...config, headers };
  });
};

const set = (field: ConfigField, value: any) => (object: any) => {
  return !isEmpty(value) ? { ...object, [field]: value } : object;
};

export const isEmpty = (v: any) =>
  v === undefined ||
  v === null ||
  v.length === 0 ||
  (typeof v === 'object' &&
    Object.keys(v).length === 0 &&
    v.constructor === Object);

/** URL */
export const setURL = (url: string) => set('url', url);

/** METHOD */
export const setMethod = (method: 'GET' | 'POST' | 'PUT' | 'DELETE') =>
  set('method', method);

/** Param */
export const setParams = (params: Params | undefined) => set('params', params);

export const setHeaders =
  (newHeaders: any = {}) =>
  (object: any) => {
    return !isEmpty(newHeaders)
      ? { ...object, headers: { ...object.headers, ...newHeaders } }
      : object;
  };

/**
 * Validate and set data in the request configuration object.
 */
export const setData = (
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data: any,
  /**
   * If a schema is provided, execute its validate method. If the validation fails, the
   * errors will be set at L.validationError's path.
   */
  schema?: AnySchema,
  /**
   * postValidationTransform will be applied to the data just before it's set on the configuration
   * object, after the validation has happened. Use with caution: It was created as a trap door for
   * merging IPv4 addresses and ports in the NodeBalancer creation flow.
   */
  postValidationTransform?: (_: any) => any,
): any => {
  if (!schema) {
    return set('data', data);
  }

  const updatedData =
    typeof postValidationTransform === 'function'
      ? postValidationTransform(data)
      : data;

  try {
    schema.validateSync(data, { abortEarly: false });
    return set('data', updatedData);
  } catch (error) {
    return (object: any) => ({
      ...object,
      data: updatedData,
      validationErrors: convertYupToLinodeErrors(error as ValidationError),
    });
  }
};

/**
 * Attempt to convert a Yup error to our pattern. The only magic here is the recursive call
 * to itself since we have nested structures (think NodeBalancers).
 */
export const convertYupToLinodeErrors = (
  validationError: ValidationError,
): APIError[] => {
  const { inner } = validationError;

  /** If aggregate errors */
  if (inner && inner.length > 0) {
    return inner.reduce((result: APIError[], innerValidationError) => {
      const err = convertYupToLinodeErrors(innerValidationError);
      return Array.isArray(err) ? [...result, ...err] : [...result, err];
    }, []);
  }

  /** If single error.  */
  return [mapYupToLinodeAPIError(validationError)];
};

const mapYupToLinodeAPIError = ({
  message,
  path,
}: ValidationError): APIError => ({
  reason: message,
  ...(path && { field: path }),
});

/** X-Filter */
export const setXFilter = (xFilter: Filter | undefined) => {
  return (object: any) =>
    !isEmpty(xFilter)
      ? {
          ...object,
          headers: { ...object.headers, 'X-Filter': JSON.stringify(xFilter) },
        }
      : object;
};

/**
 * Builds up a config starting from a default object and applying
 * each of the applied functions.
 *
 * URL is defaulted for testing purposes; otherwise all requests will
 * fail unless setURL() is used in the chain.
 *
 * Config is defaulted to an empty object because setHeaders() merges
 * with the existing headers object, unlike all other setters which directly
 * assign the value. If setHeaders() is called and no headers are present, the result
 * is an error.
 * @param fns An array of functions to be applied to the config object.
 */
const reduceRequestConfig = (...fns: RequestConfigFn[]): RequestConfig =>
  fns.reduceRight<RequestConfig>((result, fn) => fn(result), {
    url: 'https://api.linode.com/v4',
    headers: {},
  });

/** Generator */
export const requestGenerator = <T>(...fns: RequestConfigFn[]): Promise<T> => {
  const config = reduceRequestConfig(...fns);
  if (config.validationErrors) {
    return Promise.reject(
      config.validationErrors, // All failed requests, client or server errors, should be APIError[]
    );
  }
  return baseRequest(config).then((response) => response.data);
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
            config: {
              headers: new AxiosHeaders(),
            },
          }),
        ),
      process.env.NODE_ENV === 'test' ? 0 : 250,
    ),
  );

const createError = (message: string, response: AxiosResponse) => {
  const error = new Error(message) as any;
  error.response = response;
  return error;
};

export interface CancellableRequest<T> {
  request: () => Promise<T>;
  cancel: () => void;
}

export const CancellableRequest = <T>(
  ...fns: RequestConfigFn[]
): CancellableRequest<T> => {
  const config = reduceRequestConfig(...fns);
  const source = Axios.CancelToken.source();

  if (config.validationErrors) {
    return {
      cancel: () => null,
      request: () =>
        Promise.reject({
          config: { ...config, validationErrors: undefined },
          response: { data: { errors: config.validationErrors } },
        }),
    };
  }

  return {
    cancel: source.cancel,
    request: () =>
      baseRequest({ ...config, cancelToken: source.token }).then(
        (response) => response.data,
      ),
  };
};

/**
 * setUserAgentPrefix
 *
 * Helper function to set a custom prefix on the user agent
 *
 * @param prefix
 */
export const setUserAgentPrefix = (prefix: string) => {
  return baseRequest.interceptors.request.use((config) => {
    const headers = new AxiosHeaders(config.headers);

    headers.set('User-Agent', `${prefix}/${config.headers['User-Agent']}`);

    return { ...config, headers };
  });
};

export default requestGenerator;
