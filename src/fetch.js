import { API_ROOT } from './constants';
import _fetch from 'isomorphic-fetch';

export function fetch(token, input, init) {
  init = {
    mode: 'cors',
    ...init,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `token ${token}`,
    },
  };
  if (typeof input === 'string') {
    input = API_ROOT + input;
  }
  return _fetch(input, init);
}
