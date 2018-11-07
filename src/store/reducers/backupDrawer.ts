import { pathOr } from 'ramda';
import { compose, Dispatch } from 'redux';

import { enableAllBackups as _enableAllBackups } from 'src/features/Backups/utils';
import { getLinodes } from 'src/services/linodes';
import { getAll } from 'src/utilities/getAll';

// HELPERS

const getAllLinodes = getAll(getLinodes);

// TYPES
type Linode = Linode.Linode;
type State = BackupDrawerState;

interface Action {
  type: string;
  error?: Error;
  data?: any;
}

type ActionCreator = (...args: any[]) => Action;

// ACTIONS
export const OPEN = '@manager/backups/OPEN'
export const CLOSE = '@manager/backups/CLOSE'
export const LOAD = '@manager/backups/LOAD'
export const ERROR = '@manager/backups/ERROR'
export const SUCCESS = '@manager/backups/SUCCESS'
export const ENABLE = '@manager/backups/ENABLE'
export const ENABLE_SUCCESS = '@manager/backups/ENABLE_SUCCESS'
export const ENABLE_ERROR = '@manager/backups/ENABLE_ERROR'
export const RESET_ERRORS = '@manager/backups/RESET_ERRORS'
export const RESET_SUCCESS = '@manager/backups/RESET_SUCCESS'

// ACTION CREATORS
export const startRequest: ActionCreator = () => ({ type: LOAD });

export const handleError: ActionCreator = (error: Error) => ({ type: ERROR, error });

export const handleSuccess: ActionCreator = (data: Linode[]) => ({ type: SUCCESS, data });

export const handleEnable: ActionCreator = () => ({ type: ENABLE });

export const handleEnableSuccess: ActionCreator = () => ({ type: ENABLE_SUCCESS });

export const handleEnableError: ActionCreator = (error: Error) => ({ type: ENABLE_ERROR, error });

export const handleResetSuccess: ActionCreator = () => ({ type: RESET_SUCCESS });

export const handleResetError: ActionCreator = () => ({ type: RESET_ERRORS });

export const handleOpen: ActionCreator = () => ({ type: OPEN });

export const handleClose: ActionCreator = () => ({ type: CLOSE });

// DEFAULT STATE
export const defaultState: State = {
  lastUpdated: 0,
  loading: false,
  enabling: false,
  data: [],
  open: false,
  error: undefined,
  enableError: undefined,
  enableSuccess: false,
};

// REDUCER
export default (state: State = defaultState, action: Action) => {
  switch (action.type) {
    case OPEN:
      return { ...state, lastUpdated: Date.now(), open: true };

    case CLOSE:
      return { ...state, lastUpdated: Date.now(), open: false };

    case LOAD:
      return { ...state, loading: true };

    case ERROR:
      return { ...state, loading: false, lastUpdated: Date.now(), error: action.error };

    case SUCCESS:
      return { ...state, loading: false, lastUpdated: Date.now(), data: action.data };

    case ENABLE:
      return { ...state, enabling: true, lastUpdated: Date.now() };

    case ENABLE_SUCCESS:
      return { ...state, enabling: false, lastUpdated: Date.now(), enableSuccess: true };

    case ENABLE_ERROR:
      return { ...state, enabling: false, lastUpdated: Date.now(), enableError: action.error };

    case RESET_ERRORS:
      return { ...state, lastUpdated: Date.now(), enableError: undefined, error: undefined };

    case RESET_SUCCESS:
      return { ...state, lastUpdated: Date.now(), enableSuccess: false, }

    default:
      return state;
  }
};


export const requestLinodesWithoutBackups = () => (dispatch: Dispatch<State>) => {
  dispatch(startRequest());
  getAllLinodes()
    // API doesn't support filtering by backup status
    .then((linodes: Linode.Linode[]) =>
      linodes.filter((linode: Linode.Linode) => !linode.backups.enabled))
    .then(compose(dispatch, handleSuccess))
    .catch(compose(dispatch, handleError));
}

export const enableAllBackups = () => (dispatch: Dispatch<State>, getState: () => State) => {
  const linodes = pathOr([],['backups', 'data'], getState());
  dispatch(handleEnable());
  return _enableAllBackups(linodes)
    .then(compose(dispatch, handleEnableSuccess))
    .catch(compose(dispatch, handleEnableError))
    .finally(compose(dispatch,requestLinodesWithoutBackups))
}
