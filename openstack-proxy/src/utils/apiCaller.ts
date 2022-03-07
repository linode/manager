import axios, { AxiosRequestConfig } from 'axios';

const OPENSTACK_URL = 'http://localhost:56080';

const HOST = OPENSTACK_URL;

const defaultInstance = {
  baseURL: HOST,
  timeout: 10000,
};

const apiCaller = axios.create(defaultInstance);

// apiCaller.interceptors.request.use(async (config) => {

//   config.headers['X-Auth-Token'] = token
//   return config;
// });

export default apiCaller;
