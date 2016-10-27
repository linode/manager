export const SET_TOKEN = '@@authentication/SET_TOKEN';
export const LOGOUT = '@@authentication/LOGOUT';

export function setToken(token, scopes, username, email, emailHash) {
  return { type: SET_TOKEN, token, scopes, username, email, emailHash };
}

export function logout() {
  return { type: LOGOUT };
}
