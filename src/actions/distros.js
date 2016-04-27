import { fetch } from '../fetch';

export const UPDATE_DISTROS = '@@distros/UPDATE_DISTROS';

export function fetchDistros(page = 0) {
  return async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, `/distributions?page=${page+1}`);
    const json = await response.json();
    dispatch({ type: UPDATE_DISTROS, response: json });
  };
}
