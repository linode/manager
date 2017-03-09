import { thunkFetch } from './apiActionReducerGenerator';

export function setPassword(password, expires) {
  return thunkFetch.post('/account/profile/password', { password, expires });
}
