import { fetch as genericFetch } from '~/fetch';


// Helper function when making calls outside of the ability of the above thunks.
function _fetch(method, stringifyBody = true) {
  return (url, body, headers = {}) =>
    async (dispatch, getState) => {
      const state = getState();
      const { token } = state.authentication;

      const result = await genericFetch(token, url, {
        method,
        headers,
        body: stringifyBody ? JSON.stringify(body) : body,
      });

      return await result.json();
    };
}

export const fetch = {
  post: _fetch('POST'),
  put: _fetch('PUT'),
  get: _fetch('GET'),
  delete: _fetch('DELETE'),
};

function _fetchFile(method) {
  const _fetchPartial = _fetch(method, false);
  return (url, attachment, type = 'image/png') =>
    _fetchPartial(url, attachment, { 'Content-Type': type });
}

export const fetchFile = {
  post: _fetchFile('POST'),
  put: _fetchFile('PUT'),
};
