import { fetch } from '../fetch';

export const UPDATE_DATACENTERS = '@@datacenters/UPDATE_DATACENTERS';
export const UPDATE_DATACENTER = '@@datacenters/UPDATE_DATACENTER';

export function fetchDatacenters(page = 0) {
  return async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, `/datacenters?page=${page+1}`);
    const json = await response.json();
    dispatch({ type: UPDATE_DATACENTERS, response: json });
  };
}
