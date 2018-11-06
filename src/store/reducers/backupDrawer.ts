// import * as Bluebird from 'bluebird';
import { compose, Dispatch } from 'redux';

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

const modes = {
  CLOSED: 'closed',
  OPEN: 'open'
}

// ACTIONS
export const LOAD = '@manager/backups/LOAD'
export const ERROR = '@manager/backups/ERROR'
export const SUCCESS = '@manager/backups/SUCCESS'
export const UPDATE = '@manager/backups/UPDATE'
export const ENABLE = '@manager/backups/ENABLE'

// ACTION CREATORS
export const startRequest: ActionCreator = () => ({ type: LOAD });

export const handleError: ActionCreator = (error: Error) => ({ type: ERROR, error });

export const handleSuccess: ActionCreator = (data: Linode[]) => ({ type: SUCCESS, data });

export const handleUpdate: ActionCreator = (data: Linode[]) => ({ type: UPDATE, data });

export const handleEnable: ActionCreator = () => ({ type: ENABLE });

// DEFAULT STATE
export const defaultState: State = {
  lastUpdated: 0,
  loading: false,
  data: [],
  mode: modes.CLOSED,
  error: undefined,
};

// REDUCER
export default (state: State = defaultState, action: Action) => {
  switch (action.type) {
    case LOAD:
      return { ...state, loading: true };

    case ERROR:
      return { ...state, loading: false, lastUpdated: Date.now(), error: action.error };

    case SUCCESS:
      return { ...state, loading: false, lastUpdated: Date.now(), data: action.data };

    case UPDATE:
      return { ...state, loading: false, lastUpdated: Date.now(), data: action.data };

    case ENABLE:
      return { ...state, loading: false, lastUpdated: Date.now() };

    default:
      return state;
  }
};


// const _enableAllBackups = (linodes: Linode.Linode[]) =>
//   Bluebird.map(linodes, (linode: Linode.Linode) =>
//     enableBackups(linode.id)
//   );

// export const enableAllBackups = () => (dispatch: Dispatch<State>) => {

//   dispatch(handleEnable());
//   _enableAllBackups()
//     .then(compose(dispatch, handleSuccess, prop('data')))
//     .catch(compose(dispatch, handleError));
// };

export const requestLinodesWithoutBackups = () => (dispatch: Dispatch<State>) => {
  dispatch(startRequest());
  getAllLinodes()
    // API doesn't support filtering by backup status
    .then((linodes: Linode.Linode[]) =>
      linodes.filter((linode: Linode.Linode) => !linode.backups.enabled))
    .then(compose(dispatch, handleSuccess))
    .catch(compose(dispatch, handleError));
}
