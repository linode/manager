import invariant from 'invariant';
import Axios from 'axios';

class LinodeAPI {
  static NULL_API_KEY_ERROR = 'LinodeAPI requires an API key';
  static NULL_BASE_URL_ERROR = 'LinodeAPI requires a baseURL';

  static tokenString = (v) => `Bearer ${v}`;

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
    invariant(apiKey, LinodeAPI.NULL_API_KEY_ERROR);
    this.apiKey = apiKey;

    this.opts.headers.Authorization = LinodeAPI.tokenString(apiKey);
  }

  get = (url, params, filter) => {
    return Axios({
      ...this.opts,
      headers: {
        ...this.opts.headers,
        'x-filter': JSON.stringify(filter),
      },
      url,
      method: 'GET',
      params,
    });
  }

  post = (url, data) => {
    return Axios({
      ...this.opts,
      url,
      method: 'POST',
      data,
    });
  }

  put = (url, data) => {
    return Axios({
      ...this.opts,
      url,
      method: 'PUT',
      data,
    });
  }

  delete = (url) => {
    return Axios.delete({
      ...this.opts,
      url,
      method: 'DELETE',
    });
  }
}

export default LinodeAPI;
