import * as isomorphicFetch from 'isomorphic-fetch';
import _ from 'lodash';

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

  let fetchRef = window.fetch;
  if (module && module.exports) {
    fetchRef = module.exports.rawFetch;
  }

  const options = _.merge({
    mode: 'cors',
    headers: {
      Accept: 'application/json',
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
  }, _options);

  if (options.body instanceof FormData) {
    delete options.headers['Content-Type'];
  }

  if (options.headers['X-Filter']) {
    options.headers['X-Filter'] = JSON.stringify(options.headers['X-Filter']);
  }

  const path = API_ROOT + _path;
  return new Promise((accept, reject) => {
    fetchRef(path, options).then((response) => {
      const { status } = response;
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
