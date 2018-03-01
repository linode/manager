import { SET_TOKEN, SetToken } from 'src/actions/authentication';

const defaultState = {
  token: null,
  scopes: null,
};

export default function authentication(state = defaultState, action: SetToken) {
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
