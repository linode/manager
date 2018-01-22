import request from '~/request';

export const fetch = {
  post: (...args) => async () => {
    const resp = await request.post(...args);
    return resp.data;
  },
  put: (...args) => async () => {
    const resp = await request.put(...args);
    return resp.data;
  },
  get: (...args) => async () => {
    const resp = await request.get(...args);
    return resp.data;
  },
  delete: (...args) => async () => {
    const resp = await request.delete(...args);
    return resp.data;
  },
};

function partialFetchFile(method) {
  return (url, attachment, type = 'image/png') =>
    request[method](url, attachment, type);
}

export const fetchFile = {
  post: (...args) => async () => {
    const resp = await partialFetchFile('post')(...args);
    return resp.data;
  },
  put: (...args) => async () => {
    const resp = await partialFetchFile('put')(...args);
    return resp.data;
  },
};
