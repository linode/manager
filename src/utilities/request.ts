import Axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { pathOr } from 'ramda';

import { ACCESS_TOKEN } from 'src/constants';

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
    /**
     * this will blow out redux state and the componentDidUpdate in the
     * AuthenticationWrapper.tsx will be responsible for redirecting to Login
     */
    store.dispatch(handleLogout());
  }

  return Promise.reject(error);
};

Axios.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    const state = store.getState();
    /** Will end up being "Admin: 1234" or "Bearer 1234" */
    const token =
      ACCESS_TOKEN || pathOr('', ['authentication', 'token'], state);

    return {
      ...config,
      headers: {
        ...config.headers,
        ...(token && { Authorization: `${token}` })
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
