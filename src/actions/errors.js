export const SET_ERROR = '@@errors/SET_ERROR';
export const TOGGLE_DETAILS = '@@errors/TOGGLE_DETAILS';

/**
 * Sets the global error state from the given HTTP response.
 * @param {Response} response - the HTTP response from the server.
 * @param {Object} json - Set this if you've already read the JSON from the response.
 */
export function setError(response, json = null) {
  return async (dispatch) => {
    const type = response.headers.get('Content-Type');
    const _json = !json && type === 'application/json'
      ? await response.json() : null;
    dispatch({
      type: SET_ERROR,
      status: response.statusCode,
      statusText: response.statusText,
      json: _json,
    });
  };
}

export function toggleDetails() {
  return { type: TOGGLE_DETAILS };
}
