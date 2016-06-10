import { API_ROOT } from './constants';
import * as isomorphicFetch from 'isomorphic-fetch';

/*
 * Sinon cannot stub out a function in a function-only module.
 * https://github.com/sinonjs/sinon/issues/664
 */
export function rawFetch(...args) {
  return isomorphicFetch['default'](...args);
}

export function fetch(token, _path, _options) {
  /*
   * Get updated reference in case rawFetch is a stub (during testing).
   * See comment on rawFetch.
   */
  const fetchRef = module.exports.rawFetch;
  const options = {
    mode: 'cors',
    ..._options,
    headers: {
      Accept: 'application/json',
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
      'X-CORS-Status': 'true',
    },
  };
  const path = API_ROOT + _path;
  const promise = fetchRef(path, options);
  return new Promise((accept, reject) => {
    promise.then(response => {
      const _status = response.headers.get('X-Status');
      const status = _status ? parseInt(_status, 10) : response.status;
      // eslint-disable-next-line no-param-reassign
      response.statusCode = status;
      if (status >= 400) {
        reject(response);
      } else {
        accept(response);
      }
    }, reject);
  });
}
