export const SET_TOKEN = '@@authentication/SET_TOKEN';

export function set_token(token, scopes, username, email) {
  return { type: SET_TOKEN, token, scopes, username, email };
}
