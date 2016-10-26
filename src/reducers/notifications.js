import { SHOW_NOTIFICATIONS, HIDE_NOTIFICATIONS } from '../actions/notifications';

export default function notifications(state = null, action) {
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
