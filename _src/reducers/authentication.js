import { SET_TOKEN } from '../actions/authentication';

const defaultState = {
  token: null,
  scopes: null,
};

export default function authentication(state = defaultState, action) {
  switch (action.type) {
    case SET_TOKEN:
      return {
        ...state,
        token: action.token,
        scopes: action.scopes,
      };
    default:
      return state;
  }
}
