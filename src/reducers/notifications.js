import { SHOW_NOTIFICATIONS, HIDE_NOTIFICATIONS } from '../actions/notifications';

const defaultState = {
  open: false,
};

export default function notifications(state = defaultState, action) {
  switch (action.type) {
    case SHOW_NOTIFICATIONS:
      return {
        open: true,
      };
    case HIDE_NOTIFICATIONS:
      return { open: false };
    default:
      return { ...state };
  }
}
