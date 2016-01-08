export const CALLBACK = '@@authentication/CALLBACK';
export const SET_TOKEN = '@@authentication/SET_TOKEN';

export function callback(query) {
  return { type: CALLBACK, query };
}

export function set_token(token, scopes) {
  return { type: SET_TOKEN, token, scopes };
}
