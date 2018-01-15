import { SHOW_MODAL, HIDE_MODAL } from '../actions/modal';

const defaultState = {
  open: false,
  title: null,
  body: null,
};

export default function modal(state = defaultState, action) {
  switch (action.type) {
    case SHOW_MODAL:
      return {
        open: true,
        title: action.title,
      };
    case HIDE_MODAL:
      return {
        open: false,
        title: null,
      };
    default:
      return { ...state };
  }
}
