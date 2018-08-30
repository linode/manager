import Axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import { reportException } from 'src/exceptionReporting';
import { expire } from 'src/session';
import store from 'src/store';

Axios.interceptors.request.use((config: AxiosRequestConfig): AxiosRequestConfig => {
  const token = store.getState().authentication.token;

  return {
    ...config,
    headers: {
      ...config.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
});

/*
Interceptor that initiates re-authentication if:
  * The response is HTTP 401 "Unauthorized"
  * The API is in Maintainence mode
Also rejects non-error responses if the API is in Maintainence mode
*/
Axios.interceptors.response.use(
  (response: AxiosResponse) => {
    if (!!response.headers['x-maintenance-mode']) {
      expire();
      Promise.reject(response);
    }

    return response;
  },
  (error: AxiosError) => {
    const { response, request } = error;

    if (!!error.config.headers['x-maintenance-mode']
      || (error.response && error.response.status === 401)) {
      expire();
    }

    if (
      response &&
      response.status &&
      ![401, 404].includes(response.status) &&
      /** Dont report failed stats requests. */
      response.config.url && !response.config.url.includes('/stats')
    ) {
      reportException(error, { response, request });
    }

    return Promise.reject(error);
  },
);
