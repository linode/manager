import { NullableString } from 'src/utils';

export const SET_TOKEN = 'authentication/SET_TOKEN';
export const LOGOUT = 'authentication/LOGOUT';

export type SetToken = { type: typeof SET_TOKEN, token: NullableString, scopes: NullableString };

export function setToken(token: NullableString, scopes: NullableString): SetToken {
  return { type: SET_TOKEN, token, scopes };
}

export type Logout = { type: typeof LOGOUT };

// This is used in the root reducer to erase all app state.
export function logout() {
  return { type: LOGOUT };
}
