import * as Bluebird from 'bluebird';
import { enableBackups, Linode } from 'linode-js-sdk/lib/linodes';
import { isEmpty, pathOr } from 'ramda';
import { Reducer } from 'redux';
import { updateAccountSettings } from 'src/store/accountSettings/accountSettings.requests';
import { updateMultipleLinodes } from 'src/store/linodes/linodes.actions';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { sendBackupsEnabledEvent } from 'src/utilities/ga';
import { ThunkActionCreator } from '../types';

export interface BackupError {
  linodeId: number;
  reason: string;
}

export interface State {
  open: boolean;
  enabling: boolean;
  enableErrors: BackupError[];
  enableSuccess: boolean;
  updatedCount: number;
  autoEnroll: boolean;
  autoEnrollError?: string;
  enrolling: boolean;
  error?: Error | Linode.ApiFieldError[];
  data?: Linode[];
}

interface Accumulator {
  success: Linode[];
  errors: BackupError[];
}

interface Action {
  type: string;
  error?: Error;
  data?: any;
}

type ActionCreator = (...args: any[]) => Action;

// ACTIONS
export const OPEN = '@manager/backups/OPEN';
export const CLOSE = '@manager/backups/CLOSE';
export const ENABLE = '@manager/backups/ENABLE';
export const ENABLE_SUCCESS = '@manager/backups/ENABLE_SUCCESS';
export const ENABLE_ERROR = '@manager/backups/ENABLE_ERROR';
export const RESET_ERRORS = '@manager/backups/RESET_ERRORS';
export const RESET_SUCCESS = '@manager/backups/RESET_SUCCESS';
export const AUTO_ENROLL = '@manager/backups/AUTO_ENROLL';
export const AUTO_ENROLL_SUCCESS = '@manager/backups/AUTO_ENROLL_SUCCESS';
export const AUTO_ENROLL_ERROR = '@manager/backups/AUTO_ENROLL_ERROR';
export const AUTO_ENROLL_TOGGLE = '@manager/backups/AUTO_ENROLL_TOGGLE';

// ACTION CREATORS
export const handleEnable: ActionCreator = () => ({ type: ENABLE });

export const handleEnableSuccess: ActionCreator = (data: number[]) => ({
  type: ENABLE_SUCCESS,
  data
});

export const handleEnableError: ActionCreator = (data: Accumulator) => ({
  type: ENABLE_ERROR,
  data
});

export const handleResetSuccess: ActionCreator = () => ({
  type: RESET_SUCCESS
});

export const handleResetError: ActionCreator = () => ({ type: RESET_ERRORS });

export const handleOpen: ActionCreator = () => ({ type: OPEN });

export const handleClose: ActionCreator = () => ({ type: CLOSE });

export const handleAutoEnroll: ActionCreator = () => ({ type: AUTO_ENROLL });

export const handleAutoEnrollSuccess: ActionCreator = () => ({
  type: AUTO_ENROLL_SUCCESS
});

export const handleAutoEnrollError: ActionCreator = (error: string) => ({
  type: AUTO_ENROLL_ERROR,
  data: error
});

export const handleAutoEnrollToggle: ActionCreator = () => ({
  type: AUTO_ENROLL_TOGGLE
});

// DEFAULT STATE
export const defaultState: State = {
  enabling: false,
  error: undefined,
  open: false,
  enableErrors: [],
  enableSuccess: false,
  autoEnroll: false,
  autoEnrollError: undefined,
  enrolling: false,
  updatedCount: 0
};

// REDUCER
const reducer: Reducer<State> = (
  state: State = defaultState,
  action: Action
) => {
  switch (action.type) {
    case OPEN:
      return {
        ...state,
        lastUpdated: Date.now(),
        open: true,
        error: undefined,
        enableErrors: [],
        autoEnrollError: undefined,
        updatedCount: 0,
        autoEnroll: false
      };

    case CLOSE:
      return { ...state, lastUpdated: Date.now(), open: false };

    case ENABLE:
      return {
        ...state,
        enabling: true,
        enableErrors: [],
        enableSuccess: false,
        lastUpdated: Date.now()
      };

    case ENABLE_SUCCESS:
      return {
        ...state,
        enabling: false,
        lastUpdated: Date.now(),
        enableSuccess: true,
        data: action.data,
        updatedCount: action.data.length
      };

    case ENABLE_ERROR:
      return {
        ...state,
        enabling: false,
        lastUpdated: Date.now(),
        enableErrors: action.data.errors,
        updatedCount: action.data.success.length,
        error: action.error
      };

    case RESET_ERRORS:
      return {
        ...state,
        lastUpdated: Date.now(),
        enableErrors: [],
        error: undefined
      };

    case RESET_SUCCESS:
      return {
        ...state,
        lastUpdated: Date.now(),
        enableSuccess: false,
        updatedCount: 0
      };

    case AUTO_ENROLL:
      return {
        ...state,
        enrolling: true
      };

    case AUTO_ENROLL_TOGGLE:
      return {
        ...state,
        autoEnroll: !state.autoEnroll
      };

    case AUTO_ENROLL_SUCCESS:
      return {
        ...state,
        autoEnrollError: undefined,
        enrolling: false
      };

    case AUTO_ENROLL_ERROR:
      return {
        ...state,
        autoEnrollError: action.data,
        enrolling: false
      };

    default:
      return state;
  }
};

export default reducer;

/**
 * gatherResponsesAndErrors
 *
 * This magic is needed to accumulate errors from any failed requests, since
 * we need to enable backups for each Linode individually. The final response
 * will be available in the .then() handler for Bluebird.reduce (below), and has
 * the form:
 *
 * {
 *  success: Linode[] Linodes that successfully enabled Backups.
 *  errors: BackupError[] Accumulated errors.
 * }
 */
export const gatherResponsesAndErrors = (
  accumulator: Accumulator,
  linode: Linode
) => {
  return enableBackups(linode.id)
    .then(() => ({
      ...accumulator,
      // This is accurate, since a 200 from the API means that backups were enabled.
      success: [
        ...accumulator.success,
        { ...linode, backups: { ...linode.backups, enabled: true } }
      ]
    }))
    .catch(error => {
      const reason = getErrorStringOrDefault(
        error,
        'Backups could not be enabled for this Linode.'
      );
      return {
        ...accumulator,
        errors: [...accumulator.errors, { linodeId: linode.id, reason }]
      };
    });
};

/* This will dispatch an async action that will send a request to enable backups for
 *  each Linode in the list of linodes without backups ('data' in the reducer state).
 *  When complete, it will dispatch appropriate actions to handle the result, depending
 *  on whether or not any errors occurred.
 */
type EnableAllBackupsThunk = ThunkActionCreator<void>;
export const enableAllBackups: EnableAllBackupsThunk = () => (
  dispatch,
  getState
) => {
  const { entities } = getState().__resources.linodes;

  const linodesWithoutBackups = entities.filter(
    linode => !linode.backups.enabled
  );

  dispatch(handleEnable());
  Bluebird.reduce(linodesWithoutBackups, gatherResponsesAndErrors, {
    success: [],
    errors: []
  })
    .then(response => {
      if (response.errors && !isEmpty(response.errors)) {
        dispatch(handleEnableError(response));
      } else {
        dispatch(handleEnableSuccess(response.success));
      }
      dispatch(updateMultipleLinodes(response.success));
      // GA Event
      sendBackupsEnabledEvent(
        `Enabled backups for ${response.success.length} Linodes`
      );
    })
    .catch(() =>
      dispatch(
        handleEnableError([
          { linodeId: 0, reason: 'There was an error enabling backups.' }
        ])
      )
    );
};

/* Dispatches an async action that will set the backups_enabled account setting.
 *  When complete, it will dispatch appropriate actions to handle the result, including
 * updating state.__resources.accountSettings.data.backups_enabled.
 */
type EnableAutoEnrollThunk = ThunkActionCreator<void>;
export const enableAutoEnroll: EnableAutoEnrollThunk = () => (
  dispatch,
  getState
) => {
  const state = getState();
  const { backups } = state;
  const hasBackupsEnabled = pathOr(
    false,
    ['__resources', 'accountSettings', 'data', 'backups_enabled'],
    state
  );
  const shouldEnableBackups = Boolean(backups.autoEnroll);

  /** If the selected toggle setting matches the setting already on the user's account,
   * don't bother the API.
   */
  if (hasBackupsEnabled === shouldEnableBackups) {
    dispatch(enableAllBackups());
    return;
  }

  dispatch(handleAutoEnroll());
  dispatch(updateAccountSettings({ backups_enabled: shouldEnableBackups }))
    .then(_ => {
      dispatch(handleAutoEnrollSuccess());
      dispatch(enableAllBackups());
    })
    .catch(errors => {
      const finalError = getErrorStringOrDefault(
        errors,
        'Your account settings could not be updated. Please try again.'
      );
      dispatch(handleAutoEnrollError(finalError));
    });
};
