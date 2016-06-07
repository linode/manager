import {
  CHANGE_DETAIL_TAB,
  TOGGLE_EDIT_MODE,
  SET_LINODE_LABEL,
  SET_LINODE_GROUP,
} from '../actions/detail';

const defaultState = {
  tab: 0,
  editing: false,
  label: '',
  group: '',
};

export default function detail(state = defaultState, action) {
  switch (action.type) {
    case CHANGE_DETAIL_TAB:
      return { ...state, tab: action.index };
    case TOGGLE_EDIT_MODE:
      return { ...state, editing: !state.editing };
    case SET_LINODE_LABEL:
      return { ...state, label: action.label };
    case SET_LINODE_GROUP:
      return { ...state, group: action.group };
    default:
      return state;
  }
}
