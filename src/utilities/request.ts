import Axios, { AxiosRequestConfig } from 'axios';
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
