export const SET_TOKEN = '@@authentication/SET_TOKEN';
export const LOGOUT = '@@authentication/LOGOUT';

export function setToken(token, scopes) {
  return { type: SET_TOKEN, token, scopes };
}

export function logout() {
  return { type: LOGOUT };
}
