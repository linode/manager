import {
  SELECT_BACKUP,
  SELECT_NEW_OR_EXISTING,
  SELECT_EXISTING_LINODE,
  SET_TIME_OF_DAY,
  SET_DAY_OF_WEEK,
} from '../../actions/detail/backups';

const defaultState = {
  selectedBackup: null,
  target: 'new',
  linodeId: null,
  timeOfDay: '0000-0200',
  dayOfWeek: 'sunday',
};

export default function backups(state = defaultState, action) {
  switch (action.type) {
    case SELECT_BACKUP:
      return { ...state, selectedBackup: action.id };
    case SELECT_NEW_OR_EXISTING:
      return { ...state, target: action.target };
    case SELECT_EXISTING_LINODE:
      return { ...state, linodeId: action.id };
    case SET_TIME_OF_DAY:
      return { ...state, timeOfDay: action.timeOfDay };
    case SET_DAY_OF_WEEK:
      return { ...state, dayOfWeek: action.dayOfWeek };
    default:
      return state;
  }
}
