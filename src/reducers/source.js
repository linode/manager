import { SET_SOURCE } from '~/actions/source';

export default function source(state = null, action) {
  switch (action.type) {
    case SET_SOURCE:
      return { source: action.source };
    default:
      return { ...state };
  }
}
