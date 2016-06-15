import { combineReducers } from 'redux';
import {
  TOGGLE_EDIT_MODE,
  SET_LINODE_LABEL,
  SET_LINODE_GROUP,
  TOGGLE_LOADING,
} from '../../actions/detail/index';
import backups from './backups';

const defaultState = {
  editing: false,
  label: '',
  group: '',
  loading: false,
};

export function detail(state = defaultState, action) {
  switch (action.type) {
    case TOGGLE_EDIT_MODE:
      return { ...state, editing: !state.editing };
    case SET_LINODE_LABEL:
      return { ...state, label: action.label };
    case SET_LINODE_GROUP:
      return { ...state, group: action.group };
    case TOGGLE_LOADING:
      return { ...state, loading: !state.loading };
    default:
      return state;
  }
}

export default combineReducers({
  index: detail,
  backups,
});
