import { SET_ANALYTICS } from '~/actions/analytics';

export default function analytics(state = null, action) {
  switch (action.type) {
    case SET_ANALYTICS:
      return { category: action.category };
    default:
      return { ...state };
  }
}
