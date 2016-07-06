export const SET_ERROR = '@@errors/SET_ERROR';
export const TOGGLE_DETAILS = '@@errors/TOGGLE_DETAILS';

export function setError(response) {
  return async (dispatch) => {
    const type = response.headers.get('Content-Type');
    let json = 'fubar';
    if (type === 'application/json') {
      json = await response.json();
    }
    dispatch({
      type: SET_ERROR,
      status: response.statusCode,
      statusText: response.statusText,
      json,
    });
  };
}

export function toggleDetails() {
  return { type: TOGGLE_DETAILS };
}
