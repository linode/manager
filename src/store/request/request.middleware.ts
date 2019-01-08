import Axios from "axios";
import { Middleware, MiddlewareAPI } from "redux";
import { API_ROOT } from "src/constants";

export const signature = `__request`;

/** For the life of me I cant type this. */
type State = any;

const requestMiddleware: Middleware = ({ getState }: MiddlewareAPI<State>) => (next) => (action: any) => {
  const { payload, meta } = action;

  if (!meta || !meta.__request) {
    return next(action);
  }

  const { endpoint, method, actions } = meta.__request;
  const [start, done, fail] = actions;

  const path = typeof endpoint === 'string' ? endpoint : endpoint(payload);

  let params = {};
  let data = {};
  let filter;
  if (method === 'POST' || method === 'PUT') {
    data = payload;
  }

  if (method === 'GET') {
    params = payload;
  }

  if (payload.filter) {
    filter = JSON.stringify(payload.filter);
  }

  const state: ApplicationState = getState();

  next(start(params));

  const config = {
    url: `${API_ROOT}/${path}`,
    method,
    params,
    headers: {
      Authorization: `Bearer ${state.authentication.token}`,
      ...(filter && { ['X-Filter']: filter }),
    },
    data,
  };

  return Axios(config)
    .then((response) => {
      const finishAction = done({
        params: payload,
        result: response.data,
      });

      next(finishAction);

      return response.data;
    })
    .catch((error) => {
      const failAction = fail({ params: payload, error });

      next(failAction);

      return Promise.reject(error);
    })
};

export default requestMiddleware;
