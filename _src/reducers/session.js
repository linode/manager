import { SHOW_SESSION, HIDE_SESSION } from '../actions/session';

const defaultState = {
  open: false,
};

export default function session(state = defaultState, action) {
  switch (action.type) {
    case SHOW_SESSION:
      return { ...state, open: true };
    case HIDE_SESSION:
      return { ...state, open: false };
    default:
      return { ...state };
  }
}
