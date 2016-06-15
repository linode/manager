import {
  SELECT_BACKUP,
} from '../../actions/detail/backups';

const defaultState = {
  selectedBackup: null,
};

export default function backups(state = defaultState, action) {
  switch (action.type) {
    case SELECT_BACKUP:
      return { ...state, selectedBackup: action.id };
    default:
      return state;
  }
}
