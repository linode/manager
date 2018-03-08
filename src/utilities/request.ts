import Axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import store from 'src/store';
import { expire } from 'src/session';

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
    if (!!error.config.headers['x-maintenance-mode']
        || (error.response && error.response.status === 401)) {
      expire();
    }
    return Promise.reject(error);
  },
);
