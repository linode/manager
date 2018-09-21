import Axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { path, pathSatisfies } from 'ramda';

import { expire } from 'src/session';
import store from 'src/store';

const handleSuccess = (response: AxiosResponse) => {
  if (!!response.headers['x-maintenance-mode']) {
    expire();
    Promise.reject(response);
  }

  return response;
};

const handleError = (error: AxiosError) => {
  const hasMaintenanceHeader = path(['config', 'headers', 'x-maintenance-mode'], error);
  const isUnauthorized = pathSatisfies((status) => status === 401, ['response', 'status'], error);
  // const isNotFound = pathSatisfies((status) => status === 404, ['response', 'status'], error);
  // const isStatsRequest = pathSatisfies((url: string = '') => url.includes('/stats'), ['response', 'config', 'url'], error);
  const isCancelled = Axios.isCancel(error);

  if (hasMaintenanceHeader || isUnauthorized) {
    expire();
  }

  return Promise.reject({...error, isCancelled });
}

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
Axios.interceptors.response.use(handleSuccess, handleError);
