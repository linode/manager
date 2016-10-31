import { SHOW_FEEDBACK, HIDE_FEEDBACK } from '../actions/feedback';

const defaultState = {
  open: false,
};

export default function feedback(state = defaultState, action) {
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
