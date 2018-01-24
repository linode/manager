import invariant from 'invariant';
import Axios from 'axios';
import debug from 'debug';

const log = debug('LinodeAPI');
if (process.env.NODE_ENV !== 'production') {
  Axios.interceptors.request.use((config) => {
    log(`>> [${config.method}] ${config.baseURL}${config.url}`);
    return config;
  });

  Axios.interceptors.response.use(
    (response) => {
      log(`<< [${response.config.method}] ${response.config.url}`);
      return Promise.resolve(response);
    },
    (error) => {
      log(
        `<< [${error.config.method}] ${error.config.url}`,
        error.response.status,
        error.response.statusText,
        error.response.data
      );
      return Promise.reject(error);
    }
  );
}

class LinodeAPI {
  static NULL_API_KEY_ERROR = 'LinodeAPI requires an API key';
  static NULL_BASE_URL_ERROR = 'LinodeAPI requires a baseURL';

  static tokenString = (v) => `Bearer ${v}`;

  interceptors = Axios.interceptors;

  constructor(baseURL, apiKey) {
    invariant(baseURL, LinodeAPI.NULL_BASE_URL_ERROR);
    this.baseURL = baseURL;

    this.opts = {
      baseURL,
      headers: {},
    };

    if (apiKey) {
      this.key = apiKey;
    }
  }

  set key(apiKey) {
    this.apiKey = apiKey;

    this.opts.headers.Authorization = apiKey && LinodeAPI.tokenString(apiKey);
  }

  get = (url, params, filter) => {
    return Axios({
      ...this.opts,
      headers: {
        ...this.opts.headers,
        ...(filter && { 'x-filter': JSON.stringify(filter) }),
      },
      url,
      method: 'GET',
      params,
    });
  }

  post = (url, data, contentType) => {
    return Axios({
      ...this.opts,
      headers: {
        ...this.opts.headers,
        ...(contentType && { 'content-type': contentType }),
      },
      url,
      method: 'POST',
      data,
    });
  }

  put = (url, data, contentType) => {
    return Axios({
      ...this.opts,
      headers: {
        ...this.opts.headers,
        ...(contentType && { 'content-type': contentType }),
      },
      url,
      method: 'PUT',
      data,
    });
  }

  delete = (url) => {
    return Axios({
      ...this.opts,
      url,
      method: 'DELETE',
    });
  }
}

export default LinodeAPI;
