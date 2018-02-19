import { SET_ERROR } from '~/actions/errors';
import { LOCATION_CHANGE } from 'react-router-redux';

const defaultState = {
  status: null,
};

export default function errors(state = defaultState, action) {
  switch (action.type) {
    case SET_ERROR: {
      const { status } = action;
      return { ...state, status };
    }
    case LOCATION_CHANGE:
      return defaultState;
    default:
      return state;
  }
}
