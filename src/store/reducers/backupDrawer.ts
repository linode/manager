import * as Bluebird from 'bluebird';
import { isEmpty, pathOr } from 'ramda';
import { compose, Dispatch } from 'redux';

import { updateAccountSettings } from 'src/services/account';
import { enableBackups, getLinodes } from 'src/services/linodes';
import { handleUpdate } from 'src/store/reducers/resources/accountSettings';
import { getAll } from 'src/utilities/getAll';

// HELPERS

export const getAllLinodes = getAll(getLinodes);

// TYPES
type Linode = Linode.Linode;
type State = BackupDrawerState;

interface Accumulator {
  success: number[];
  errors: BackupError[];
}
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
export const AUTO_ENROLL = '@manager/backups/AUTO_ENROLL'
export const AUTO_ENROLL_SUCCESS = '@manager/backups/AUTO_ENROLL_SUCCESS'
export const AUTO_ENROLL_ERROR = '@manager/backups/AUTO_ENROLL_ERROR'
export const AUTO_ENROLL_TOGGLE = '@manager/backups/AUTO_ENROLL_TOGGLE'



// ACTION CREATORS
export const startRequest: ActionCreator = () => ({ type: LOAD });

export const handleError: ActionCreator = (error: Error) => ({ type: ERROR, error });

export const handleSuccess: ActionCreator = (data: Linode[]) => ({ type: SUCCESS, data });

export const handleEnable: ActionCreator = () => ({ type: ENABLE });

export const handleEnableSuccess: ActionCreator = (data: number[]) => ({ type: ENABLE_SUCCESS, data });

export const handleEnableError: ActionCreator = (data: BackupError[]) => ({ type: ENABLE_ERROR, data });

export const handleResetSuccess: ActionCreator = () => ({ type: RESET_SUCCESS });

export const handleResetError: ActionCreator = () => ({ type: RESET_ERRORS });

export const handleOpen: ActionCreator = () => ({ type: OPEN });

export const handleClose: ActionCreator = () => ({ type: CLOSE });

export const handleAutoEnroll: ActionCreator = () => ({ type: AUTO_ENROLL });

export const handleAutoEnrollSuccess: ActionCreator = () => ({ type: AUTO_ENROLL_SUCCESS });

export const handleAutoEnrollError: ActionCreator = (error: string) => ({ type: AUTO_ENROLL_ERROR, data: error });

export const handleAutoEnrollToggle: ActionCreator = () => ({ type: AUTO_ENROLL_TOGGLE });


// DEFAULT STATE
export const defaultState: State = {
  lastUpdated: 0,
  loading: false,
  enabling: false,
  data: [],
  open: false,
  error: undefined,
  enableErrors: [],
  enableSuccess: false,
  autoEnroll: false,
  autoEnrollError: undefined,
  enrolling: false,
};

// REDUCER
export default (state: State = defaultState, action: Action) => {
  switch (action.type) {
    case OPEN:
      return { ...state, lastUpdated: Date.now(), open: true,
        error: undefined, enableErrors: [], autoEnrollError: undefined, autoEnroll: false };

    case CLOSE:
      return { ...state, lastUpdated: Date.now(), open: false, };

    case LOAD:
      return { ...state, loading: true };

    case ERROR:
      return { ...state, loading: false, lastUpdated: Date.now(), error: action.error };

    case SUCCESS:
      return { ...state, loading: false, lastUpdated: Date.now(), data: action.data };

    case ENABLE:
      return { ...state, enabling: true, enableErrors: [], enableSuccess: false, lastUpdated: Date.now() };

    case ENABLE_SUCCESS:
      return { ...state, enabling: false, lastUpdated: Date.now(), enableSuccess: true,
        data: state.data!.filter((linode: Linode) => !action.data.includes(linode.id)) };

    case ENABLE_ERROR:
      return { ...state, enabling: false, lastUpdated: Date.now(), enableErrors: action.data };

    case RESET_ERRORS:
      return { ...state, lastUpdated: Date.now(), enableErrors: [], error: undefined };

    case RESET_SUCCESS:
      return { ...state, lastUpdated: Date.now(), enableSuccess: false, }

    case AUTO_ENROLL:
     return {...state, enrolling: true }

    case AUTO_ENROLL_TOGGLE:
     return {...state, autoEnroll: !state.autoEnroll }

    case AUTO_ENROLL_SUCCESS:
     return {...state, autoEnrollError: undefined, enrolling: false }

    case AUTO_ENROLL_ERROR:
     return {...state, autoEnrollError: action.data, enrolling: false }

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

/**
 * gatherResponsesAndErrors
 *
 * This magic is needed to accumulate errors from any failed requests, since
 * we need to enable backups for each Linode individually. The final response
 * will be available in the .then() handler for Bluebird.reduce (below), and has
 * the form:
 *
 * {
 *  success: number[] Linodes that successfully enabled Backups.
 *  errors: BackupError[] Accumulated errors.
 * }
 */
export const gatherResponsesAndErrors = (accumulator: Accumulator, linodeId: number) => {
  return enableBackups(linodeId).then(() => ({
    ...accumulator,
    success: [...accumulator.success, linodeId]
    }))
    .catch((error) => {
      const reason = pathOr('Backups could not be enabled for this Linode.',
        ['response','data','errors', 0, 'reason'], error);
      return {
      ...accumulator,
      errors: [...accumulator.errors, { linodeId, reason }]
  }})
}

/* This will dispatch an async action that will send a request to enable backups for
*  each Linode in the list of linodes without backups ('data' in the reducer state).
*  When complete, it will dispatch appropriate actions to handle the result, depending
*  on whether or not any errors occurred.
*/
export const enableAllBackups = () => (dispatch: Dispatch<State>, getState: () => State) => {
  const linodeIDs = pathOr([],['backups', 'data'], getState()).map((linode: Linode.Linode) => linode.id);
  dispatch(handleEnable());
  Bluebird.reduce(linodeIDs, gatherResponsesAndErrors, { success: [], errors: []})
    .then(({ success, errors }) => {
      if (errors && !isEmpty(errors)) {
        dispatch(handleEnableError(errors));
      }
      else {
        dispatch(handleEnableSuccess(success));
      }
      dispatch(requestLinodesWithoutBackups());
    })
    .catch(() => dispatch(
      handleEnableError([{linodeId: 0, reason: "There was an error enabling backups."}])
    ));
}

/* Dispatches an async action that will set the backups_enabled account setting.
*  When complete, it will dispatch appropriate actions to handle the result, including
* updating state.__resources.accountSettings.data.backups_enabled.
*/
export const enableAutoEnroll = () => (dispatch: Dispatch<State>, getState: () => State) => {
  const backups_enabled = pathOr(false,['backups', 'autoEnroll'], getState());
  dispatch(handleAutoEnroll());
  updateAccountSettings({ backups_enabled })
    .then((response) => {
      dispatch(handleAutoEnrollSuccess());
      dispatch(enableAllBackups());
      // Have to let the rest of the store know that the backups setting has been updated.
      dispatch(handleUpdate(response));
    })
    .catch((errors) => {
      const defaultError = "Your account settings could not be updated. Please try again.";
      const finalError =  pathOr(defaultError, ['response', 'data', 'errors', 0, 'reason'], errors);
      dispatch(handleAutoEnrollError(finalError));
    });
}
