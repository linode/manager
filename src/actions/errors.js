export const SET_ERROR = '@@errors/SET_ERROR';
export const TOGGLE_DETAILS = '@@errors/TOGGLE_DETAILS';


export function setError(response = {}) {
  return async (dispatch) => {
    if (response.status) {
      const type = response.headers && response.headers.get('Content-Type');
      const _json = !json && type === 'application/json'
                  ? response.json() : null;

      dispatch({
        type: SET_ERROR,
        status: response.status,
        statusText: response.statusText,
        json: _json,
      });
    } else if (response.message === 'Failed to fetch') {
      dispatch({
        type: SET_ERROR,
        status: 521,
        statusText: 'Failed connecting to server.',
      });
    }
  }
}

export function toggleDetails() {
  return { type: TOGGLE_DETAILS };
}
