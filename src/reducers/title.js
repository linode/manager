import { SET_TITLE } from '~/actions/title';

export default function title(state = null, action) {
  switch (action.type) {
    case SET_TITLE:
      document.title = `${action.title} - Linode`;
      return { title: action.title };
    default:
      return { ...state };
  }
}
