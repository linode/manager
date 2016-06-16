import {
  SELECT_BACKUP,
  SELECT_TARGET_LINODE,
  SET_TIME_OF_DAY,
  SET_DAY_OF_WEEK,
} from '../../actions/detail/backups';

const defaultState = {
  selectedBackup: null,
  targetLinode: '',
  timeOfDay: '0000-0200',
  dayOfWeek: 'sunday',
};

export default function backups(state = defaultState, action) {
  switch (action.type) {
    case SELECT_BACKUP:
      return { ...state, selectedBackup: action.id };
    case SELECT_TARGET_LINODE:
      return { ...state, targetLinode: action.id };
    case SET_TIME_OF_DAY:
      return { ...state, timeOfDay: action.timeOfDay };
    case SET_DAY_OF_WEEK:
      return { ...state, dayOfWeek: action.dayOfWeek };
    default:
      return state;
  }
}
