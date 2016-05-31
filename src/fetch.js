import { API_ROOT } from './constants';
import * as isomorphicFetch from 'isomorphic-fetch';

/*
 * Sinon cannot stub out a function in a function-only module.
 * https://github.com/sinonjs/sinon/issues/664
 */
export function _fetch(...args) {
  return isomorphicFetch['default'](...args);
}

export function fetch(token, _path, _options) {
  /*
   * Get updated reference in case _fetch is a stub (during testing).
   * See comment on _fetch.
   */
  const fetchRef = module.exports._fetch;
  const options = {
    mode: 'cors',
    ..._options,
    headers: {
      Accept: 'application/json',
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
  };
  const path = API_ROOT + _path;
  return fetchRef(path, options);
}
