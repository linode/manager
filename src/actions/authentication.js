export const SET_TOKEN = '@@authentication/SET_TOKEN';

export function setToken(token, scopes, username, email, emailHash) {
  return { type: SET_TOKEN, token, scopes, username, email, emailHash };
}
