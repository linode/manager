import fetch from '../fetch';

export const UPDATE_LINODES = "@@linodes/UPDATE_LINODES";
export const UPDATE_LINODE = "@@linodes/UPDATE_LINODE";

function shouldUpdate(state) {
  if (state.localPage !== state.remotePage) {
    return true;
  }
  // TODO: Other conditions?
  return false;
}

export function updateLinodesIfNecessary() {
  return async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, "/linodes");
    const json = await response.json();
    dispatch({ type: UPDATE_LINODES, response: json });
  };
}

export function updateLinode(id) {
  return async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, `/linodes/${id}`);
    dispatch({ type: UPDATE_LINODE, response: response.json() });
  };
}

export function updateLinodeUntil(id, test, timeout=3000) {
  const update = async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, `/linodes/${id}`);
    dispatch({ type: UPDATE_LINODE, response });
    if (!test(response)) {
      setTimeout(() => update(dispatch, getState), timeout);
    }
  };
  return update;
}

/*
export function powerOffLinode(id) {
  return async (dispatch, getState) => {
    const response = await fetch(token, 
  };
}
*/
