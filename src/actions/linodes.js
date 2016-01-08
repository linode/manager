import fetch from '../fetch';

export const UPDATE_LINODES = "@@linodes/UPDATE_LINODES";

export function update_linodes(token) {
  return async dispatch => {
    const response = await fetch(token, "/linodes");
    dispatch({ type: UPDATE_LINODES, response });
  };
}
