import { SET_TOKEN } from '../actions/authentication';

export default function authentication(state = null, action) {
  switch (action.type) {
    case SET_TOKEN:
      return {
        ...state,
        token: action.token,
        scopes: action.scopes,
        username: action.username,
        email: action.email,
        emailHash: action.emailHash,
      };
    default:
      return state;
  }
}
