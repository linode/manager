import fetch from 'isomorphic-fetch';

export default class LinodeAPI {
  constructor(apiRoot, authToken, /* expireTimestamp, refreshToken */) {
    this.apiRoot = apiRoot;
    this.authToken = authToken;
    // this.expireTimestamp
    // this.refreshToken = refreshToken;
  }

  /* TODO: Implement refresh tokens
  useRefreshToken = () => { }
  */

  fetchOptions = (method, body, filter, headers) => {
    const options = {
      method,
      body,
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const contentType = (options.headers['Content-Type'] || '').toLowerCase();
    if (contentType === 'application/json') {
      options.body = JSON.stringify(options.body);
    }

    // FormData will set the Content-Type header itself.
    if (options.body instanceof FormData) {
      delete options.headers['Content-Type'];
    }

    if (filter) {
      options.headers['X-Filter'] = JSON.stringify(filter);
    }

    return options;
  }

  partialFetch = (method = 'GET') => {
    return (url, body, filter, headers = {}) => {
      /* TODO: Implement refresh tokens
      if (Date.now() > this.expireTimestamp) {
        this.useRefreshToken();
      }
      */
      const options = this.fetchOptions(method, body, filter, headers);
      const path = this.apiRoot + url;
      return fetch(path, options);
    };
  }

  fetch = {
    get: this.partialFetch('GET'),
    put: this.partialFetch('PUT'),
    post: this.partialFetch('POST'),
    delete: this.partialFetch('DELETE'),
  }

  partialFetchFile(method) {
    return (url, attachment, type = 'image/png') =>
      (this.fetch[method](url, attachment, { 'Content-Type': type }));
  }

  fetchFile = {
    post: this.partialFetchFile('post'),
    put: this.partialFetchFile('put'),
  };
}
