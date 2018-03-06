import { SHOW_NOTIFICATIONS, HIDE_NOTIFICATIONS } from '../actions/notifications';

const defaultState = {
  open: false,
};

export default function notifications(state = defaultState, action) {
  switch (action.type) {
    case SHOW_NOTIFICATIONS:
      return { ...state, open: true };
    case HIDE_NOTIFICATIONS:
      return { ...state, open: false };
    default:
      return { ...state };
  }
}
