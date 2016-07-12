export const SET_ERROR = '@@errors/SET_ERROR';
export const TOGGLE_DETAILS = '@@errors/TOGGLE_DETAILS';

/**
 * Sets the global error state from the given HTTP response.
 * @param {Response} response - the HTTP response from the server.
 * @param {Object} _json - Set this if you've already read the JSON from the response.
 */
export function setError(response, _json = null) {
  return async (dispatch) => {
    const type = response.headers.get('Content-Type');
    let json = _json;
    if (!_json && type === 'application/json') {
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
