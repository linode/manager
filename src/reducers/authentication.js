import { CALLBACK, SET_TOKEN } from '../actions/authentication';
import { getStorage, setStorage } from '~/storage';

export default function authentication(state = null, action) {
  if (state === null) {
    const token = getStorage("authentication/oauth-token");
    state = { token };
  }
  switch (action.type) {
  case SET_TOKEN:
      let newState = {
          ...state,
          scopes: action.scopes,
          username: action.username,
          email: action.email,
          token: action.token
      };
      setStorage("authentication/oauth-token", action.token);
      return newState;
  default:
      return state;
  }
}
