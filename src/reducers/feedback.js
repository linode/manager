import { SHOW_FEEDBACK, HIDE_FEEDBACK } from '../actions/feedback';

export default function feedback(state = null, action) {
  switch (action.type) {
    case SHOW_FEEDBACK:
      return {
        open: true,
      };
    case HIDE_FEEDBACK:
      return { open: false };
    default:
      return { ...state };
  }
}
