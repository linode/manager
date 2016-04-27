import { fetch } from '../fetch';

export const UPDATE_SERVICES = '@@services/UPDATE_SERVICES';

export function fetchServices(page = 0) {
  return async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, `/services?page=${page+1}`);
    const json = await response.json();
    dispatch({ type: UPDATE_SERVICES, response: json });
  };
}
