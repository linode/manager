import { SET_ERROR, TOGGLE_DETAILS } from '~/actions/errors';

const defaultState = {
  json: null,
  status: null,
  statusText: null,
  details: false,
};

export default function errors(state = defaultState, action) {
  switch (action.type) {
    case SET_ERROR: {
      const { json, status, statusText } = action;
      return { ...state, json, status, statusText };
    }
    case TOGGLE_DETAILS:
      return { ...state, details: !state.details };
    default:
      return state;
  }
}
