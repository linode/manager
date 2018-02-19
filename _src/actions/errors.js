export const SET_ERROR = '@@errors/SET_ERROR';
export const TOGGLE_DETAILS = '@@errors/TOGGLE_DETAILS';


export function setError(response = {}) {
  return async (dispatch) => {
    if (response.status === 404) {
      dispatch({
        type: SET_ERROR,
        status: response.status,
      });
    }
  };
}

export function toggleDetails() {
  return { type: TOGGLE_DETAILS };
}
