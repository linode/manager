export const SET_TOKEN = 'authentication/SET_TOKEN';
export const LOGOUT = 'authentication/LOGOUT';

import { TodoAny } from 'src/utils';

export function setToken(token: string | null, scopes: TodoAny) {
  return { type: SET_TOKEN, token, scopes };
}

// This is used in the root reducer to erase all app state.
export function logout() {
  return { type: LOGOUT };
}
