import { SHOW_MODAL } from '../actions/modal';

export default function modal(state = null, action) {
  switch (action.type) {
    case SHOW_MODAL:
      return {
        open: true,
        title: action.title,
        body: action.body,
      };
    default:
      return {
        open: false,
        title: null,
        body: null,
      };
  }
}
