import Axios, { AxiosRequestConfig } from "axios";
import { Middleware, MiddlewareAPI } from "redux";
import { API_ROOT } from "src/constants";
import { convertYupToLinodeErrors } from "src/services";

export const signature = `__request`;

/** For the life of me I cant type this. */
type State = any;

const requestMiddleware: Middleware = ({ getState }: MiddlewareAPI<State>) => (next) => (action: any) => {
  const { payload, meta } = action;

  if (!meta || !meta.__request) {
    return next(action);
  }

  const { endpoint, method, actions, validationSchema } = meta.__request;
  const [start, done, fail] = actions;

  const config: AxiosRequestConfig = {
    method,
  }

  /** URL */
  try {
    const path = typeof endpoint === 'string' ? endpoint : endpoint(payload);
    config.url = `${API_ROOT}/${path}`;
  } catch (error) {
    next(fail({ params: payload, error }));
  }

  /** Params */
  if (method === 'GET') {
    config.params = payload;
  }

  /** Data */
  if (method === 'POST' || method === 'PUT') {
    config.data = payload;
  }

  /** Validation */
  if (validationSchema) {
    try {
      validationSchema.validateSync(payload, { abortEarly: false });
    } catch (yupError) {
      const error = convertYupToLinodeErrors(yupError);

      next(fail({ error, params: payload }));

      /** We're matching the pattern of returning an AxiosError. */
      return Promise.reject({ response: { data: { errors: error } } });
    }
  }


  /** Headers */
  const state: ApplicationState = getState();
  config.headers = {
    Authorization: `Bearer ${state.authentication.token}`,
  }

  /** X-Filter */
  const { filter } = payload;
  if (filter) {
    config.headers = { ...config.headers, ['X-Filter']: JSON.stringify(payload.filter) }
  }

  next(start(payload));

  return Axios(config)
    .then((response) => {
      const doneAction = done({
        params: payload,
        result: response.data,
      });

      next(doneAction);

      return response.data;
    })
    .catch((error) => {
      const failAction = fail({
        params: payload,
        error,
      });

      next(failAction);

      return Promise.reject(error);
    })
};

export default requestMiddleware;
