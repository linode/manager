import { thunkFetch } from './apiActionReducerGenerator';

export function setPassword(password, expires) {
  return thunkFetch.post('/account/profile/password', { password, expires });
}

export function enableTFA() {
  return thunkFetch.post('/account/profile/tfa-enable');
}
export function confirmTFA(code) {
  return thunkFetch.post('/account/profile/tfa-enable-confirm', { tfa_code: code });
}
export function disableTFA() {
  return thunkFetch.post('/account/profile/tfa-disable');
}
