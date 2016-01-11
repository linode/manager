import { API_ROOT } from './constants';
import fetch from 'isomorphic-fetch';

export default function _fetch(token, input, init) {
  init = {
    mode: 'cors',
    ...init,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `token ${token}`
    },
  };
  if (typeof input === "string") {
    input = API_ROOT + input;
  }
  return fetch(input, init);
}
