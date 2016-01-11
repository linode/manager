import fetch from '../fetch';

export const UPDATE_LINODES = "@@linodes/UPDATE_LINODES";

function shouldUpdate(state) {
  if (state.localPage !== state.remotePage) {
    return true;
  }
  // TODO: Other conditions?
  return false;
}

export function updateLinodesIfNecessary(token) {
  return async (dispatch, getState) => {
    const response = await fetch(token, "/linodes");
    dispatch({ type: UPDATE_LINODES, response });
  };
}
