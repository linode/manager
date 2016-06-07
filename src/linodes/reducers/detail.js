import { CHANGE_DETAIL_TAB } from '../actions/detail';

const defaultState = { tab: 0 };

export default function detail(state = defaultState, action) {
  switch (action.type) {
    case CHANGE_DETAIL_TAB:
      return { ...state, tab: action.index };
    default:
      return state;
  }
}
