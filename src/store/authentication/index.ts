import { Reducer } from 'redux';

const SET_TOKEN = '@@manager/authentication/SET_TOKEN';
const LOGOUT = '@@manager/authentication/LOGOUT';

export interface State {
  token: null | string;
  scopes: null | string;
}

export interface SetToken {
  type: typeof SET_TOKEN;
  token: Linode.NullableString;
  scopes: Linode.NullableString;
}

export const setToken = (
  token: Linode.NullableString,
  scopes: Linode.NullableString
): SetToken => {
  return {
    type: SET_TOKEN,
    token,
    scopes
  };
};

export interface Logout {
  type: typeof LOGOUT;
}

export const defaultState = {
  token: null,
  scopes: null
};

const authentication: Reducer<State> = (
  state = defaultState,
  action: SetToken
) => {
  switch (action.type) {
    case SET_TOKEN:
      return {
        ...state,
        token: action.token,
        scopes: action.scopes
      };
    default:
      return state;
  }
};

// This is used in the root reducer to erase all app state.
export const logout = () => {
  return { type: LOGOUT };
};

export default authentication;
