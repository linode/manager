import * as isomorphicFetch from 'isomorphic-fetch';

import { store } from '~/store';
import { checkLogin } from '~/session';
import { setToken } from '~/actions/authentication';
import { API_ROOT } from './constants';

/*
 * Sinon cannot stub out a function in a function-only module.
 * https://github.com/sinonjs/sinon/issues/664
 */
export function rawFetch(...args) {
  return isomorphicFetch['default'](...args);
}

function expireSession() {
  const next = { location: window.location };
  store.dispatch(setToken(null, null, null, null));
  checkLogin(next);
}

export function fetch(token, _path, _options) {
  /*
   * Get updated reference in case rawFetch is a stub (during testing).
   * See comment on rawFetch.
   */
  const _headers = _options && _options.headers || {};
  const fetchRef = module.exports.rawFetch;
  const options = {
    mode: 'cors',
    ..._options,
    headers: {
      ..._headers,
      Accept: 'application/json',
      Authorization: `token ${token}`,
      'Content-Type': (_headers && _headers['Content-Type'] || 'application/json'),
    },
  };

  if (options.headers['X-Filter']) {
    options.headers['X-Filter'] = JSON.stringify(options.headers['X-Filter']);
  }

  const path = API_ROOT + _path;
  const promise = fetchRef(path, options);
  return new Promise((accept, reject) => {
    promise.then((response) => {
      const status = response.statusCode;
      if (status >= 400) {
        if (status === 401) {
          expireSession();
        }

        reject(response);
      } else {
        accept(response);
      }
    }, reject);
  });
}
