import { resetEventsPoll } from '~/actions/events';
import { API_ROOT } from '~/constants';
import { rawFetch } from '~/fetch';
import * as session from '~/session';


function gatherOptions(token, method, body, headers) {
  const options = {
    method,
    body,
    mode: 'cors',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  const contentType = (options.headers['Content-Type'] || '').toLowerCase();
  if (contentType === 'application/json') {
    options.body = JSON.stringify(options.body);
  }

  // FormData needs to set the Content-Type header itself.
  if (options.body instanceof FormData) {
    delete options.headers['Content-Type'];
  }

  if (options.headers['X-Filter']) {
    options.headers['X-Filter'] = JSON.stringify(options.headers['X-Filter']);
  }

  return options;
}

function partialFetch(method = 'GET') {
  return function (url, body, headers = {}) {
    return async function (dispatch, getState) {
      const state = getState();
      const { token } = state.authentication;

      const options = gatherOptions(token, method, body, headers);
      const path = API_ROOT + url;

      if (['put', 'post', 'delete'].indexOf(method.toLowerCase()) !== -1) {
        dispatch(resetEventsPoll());
      }

      return new Promise((accept, reject) => {
        rawFetch(path, options).then(async (response) => {
          const { status, headers } = response;
          const inMaintenanceMode = !!headers['X-MAINTENANCE-MODE'];
          if (status >= 400 || inMaintenanceMode) {
            if (status === 401 || inMaintenanceMode) {
              dispatch(session.expireAndReAuth);
            }

            reject(response);
          } else {
            const json = await response.json();
            accept(json);
          }
        }, reject);
      });
    };
  };
}

export const fetch = {
  post: partialFetch('POST'),
  put: partialFetch('PUT'),
  get: partialFetch('GET'),
  delete: partialFetch('DELETE'),
};

function partialFetchFile(method) {
  return (url, attachment, type = 'image/png') =>
    (dispatch) => dispatch(fetch[method](url, attachment, { 'Content-Type': type }));
}

export const fetchFile = {
  post: partialFetchFile('post'),
  put: partialFetchFile('put'),
};
