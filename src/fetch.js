import { API_ROOT } from './constants';
import _fetch from 'isomorphic-fetch';

export function fetch(token, _input, _init) {
  const init = {
    mode: 'cors',
    ..._init,
    headers: {
      Accept: 'application/json',
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
  };
  const input = API_ROOT + _input;
  return _fetch(input, init);
}
