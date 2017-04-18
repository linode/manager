import { SHOW_ACCOUNT, HIDE_ACCOUNT } from '../actions/account';

const defaultState = {
  open: false,
};

export default function account(state = defaultState, action) {
  switch (action.type) {
    case SHOW_ACCOUNT:
      return { ...state, open: true };
    case HIDE_ACCOUNT:
      return { ...state, open: false };
    default:
      return { ...state };
  }
}
