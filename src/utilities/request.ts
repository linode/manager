import Axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { path } from 'ramda';

import store from 'src/store';
import { handleLogout } from 'src/store/authentication/authentication.actions';

const handleSuccess = (response: AxiosResponse) => {
  if (!!response.headers['x-maintenance-mode']) {
    store.dispatch(handleLogout());
    Promise.reject(response);
  }

  return response;
};

export const handleError = (error: AxiosError) => {
  if (
    !!error.config.headers['x-maintenance-mode'] ||
    (error.response && error.response.status === 401)
  ) {
    store.dispatch(handleLogout());
  }

  return Promise.reject(error);
};

Axios.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    const state = store.getState();
    const token = path(['authentication', 'token'], state);

    return {
      ...config,
      headers: {
        ...config.headers,
        ...(token && { Authorization: `Bearer ${token}` })
      }
    };
  }
);

/*
Interceptor that initiates re-authentication if:
  * The response is HTTP 401 "Unauthorized"
  * The API is in Maintainence mode
Also rejects non-error responses if the API is in Maintainence mode
*/
Axios.interceptors.response.use(handleSuccess, handleError);
