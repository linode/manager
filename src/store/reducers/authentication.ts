const SET_TOKEN = '@@manager/authentication/SET_TOKEN';
const LOGOUT = '@@manager/authentication/LOGOUT';

export type SetToken = {
  type: typeof SET_TOKEN,
  token: Linode.NullableString,
  scopes: Linode.NullableString,
};

export function setToken(
  token: Linode.NullableString,
  scopes: Linode.NullableString,
): SetToken {
  return {
    type: SET_TOKEN,
    token,
    scopes,
  };
}

export type Logout = { type: typeof LOGOUT };

export const defaultState = {
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

// This is used in the root reducer to erase all app state.
export function logout() {
  return { type: LOGOUT };
}
