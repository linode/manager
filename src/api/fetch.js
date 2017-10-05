import { resetEventsPoll } from '~/actions/events';
import { API_ROOT } from '~/constants';
import rawFetch from '~/fetch';
import * as session from '~/session';


function gatherOptions(token, method, body, headers) {
  const options = {
    method,
    mode: 'cors',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (options.body instanceof FormData) {
    delete options.headers['Content-Type'];
  }

  if (options.headers['X-Filter']) {
    options.headers['X-Filter'] = JSON.stringify(options.headers['X-Filter']);
  }

  return options;
}

export function partialFetch(method = 'GET', stringifyBody = true) {
  return function (url, body, headers = {}) {
    return async function (dispatch, getState) {
      const state = getState();
      const { token } = state.authentication;

      const encodedBody = stringifyBody ? JSON.stringify(body) : body;
      const options = gatherOptions(token, method, encodedBody, headers);

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
  const partialFetchPartial = partialFetch(method, false);
  return (url, attachment, type = 'image/png') =>
    partialFetchPartial(url, attachment, { 'Content-Type': type });
}

export const fetchFile = {
  post: partialFetchFile('POST'),
  put: partialFetchFile('PUT'),
};
