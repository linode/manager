import { SHOW_NOTIFICATIONS } from '../actions/notifications';

export default function notifications(state = null, action) {
  switch (action.type) {
    case SHOW_NOTIFICATIONS:
      return {
        open: true,
      };
    default:
      return { open: false };
  }
}
