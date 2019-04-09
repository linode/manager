import Axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { pathOr } from 'ramda';

import { ACCESS_TOKEN, TOKEN_PREFIX } from 'src/constants';

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
    const token =
      ACCESS_TOKEN || pathOr('', ['authentication', 'token'], state);

    /*
     if we're logged in as a customer, our authentication header needs 
     to look like this:
     
     "Admin 123123213"

     otherwise, we use the "Bearer" prefix
     */
    const tokenPrefix =
      TOKEN_PREFIX ||
      pathOr(false, ['authentication', 'loggedInAsCustomer'], store.getState())
        ? 'Admin'
        : 'Bearer';

    return {
      ...config,
      headers: {
        ...config.headers,
        ...(token && { Authorization: `${tokenPrefix} ${token}` })
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
