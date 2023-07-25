import { updateAccountSettings } from '@linode/api-v4/lib';
import { Linode, enableBackups } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import * as Bluebird from 'bluebird';
import { isEmpty } from 'ramda';
import { QueryClient } from 'react-query';
import { Reducer } from 'redux';

import {
  queryKey,
  updateAccountSettingsData,
} from 'src/queries/accountSettings';
import { updateMultipleLinodes } from 'src/store/linodes/linodes.actions';
import { getLinodesWithoutBackups } from 'src/store/selectors/getLinodesWithBackups';
import { sendBackupsEnabledEvent } from 'src/utilities/analytics';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { ThunkActionCreator } from '../types';

export interface BackupError {
  linodeId: number;
  reason: string;
}

export interface State {
  autoEnroll: boolean;
  autoEnrollError?: string;
  data?: Linode[];
  enableErrors: BackupError[];
  enableSuccess: boolean;
  enabling: boolean;
  enrolling: boolean;
  error?: APIError[] | Error;
  open: boolean;
  updatedCount: number;
}

interface Accumulator {
  errors: BackupError[];
  success: Linode[];
}

interface Action {
  data?: any;
  error?: Error;
  type: string;
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
  data,
  type: ENABLE_SUCCESS,
});

export const handleEnableError: ActionCreator = (data: Accumulator) => ({
  data,
  type: ENABLE_ERROR,
});

export const handleResetSuccess: ActionCreator = () => ({
  type: RESET_SUCCESS,
});

export const handleResetError: ActionCreator = () => ({ type: RESET_ERRORS });

export const handleOpen: ActionCreator = () => ({ type: OPEN });

export const handleClose: ActionCreator = () => ({ type: CLOSE });

export const handleAutoEnroll: ActionCreator = () => ({ type: AUTO_ENROLL });

export const handleAutoEnrollSuccess: ActionCreator = () => ({
  type: AUTO_ENROLL_SUCCESS,
});

export const handleAutoEnrollError: ActionCreator = (error: string) => ({
  data: error,
  type: AUTO_ENROLL_ERROR,
});

export const handleAutoEnrollToggle: ActionCreator = () => ({
  type: AUTO_ENROLL_TOGGLE,
});

// DEFAULT STATE
export const defaultState: State = {
  autoEnroll: false,
  autoEnrollError: undefined,
  enableErrors: [],
  enableSuccess: false,
  enabling: false,
  enrolling: false,
  error: undefined,
  open: false,
  updatedCount: 0,
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
        autoEnroll: true,
        autoEnrollError: undefined,
        enableErrors: [],
        error: undefined,
        lastUpdated: Date.now(),
        open: true,
        updatedCount: 0,
      };

    case CLOSE:
      return { ...state, lastUpdated: Date.now(), open: false };

    case ENABLE:
      return {
        ...state,
        enableErrors: [],
        enableSuccess: false,
        enabling: true,
        lastUpdated: Date.now(),
      };

    case ENABLE_SUCCESS:
      return {
        ...state,
        data: action.data,
        enableSuccess: true,
        enabling: false,
        lastUpdated: Date.now(),
        updatedCount: action.data.length,
      };

    case ENABLE_ERROR:
      return {
        ...state,
        enableErrors: action.data.errors,
        enabling: false,
        error: action.error,
        lastUpdated: Date.now(),
        updatedCount: action.data.success.length,
      };

    case RESET_ERRORS:
      return {
        ...state,
        enableErrors: [],
        error: undefined,
        lastUpdated: Date.now(),
      };

    case RESET_SUCCESS:
      return {
        ...state,
        enableSuccess: false,
        lastUpdated: Date.now(),
        updatedCount: 0,
      };

    case AUTO_ENROLL:
      return {
        ...state,
        enrolling: true,
      };

    case AUTO_ENROLL_TOGGLE:
      return {
        ...state,
        autoEnroll: !state.autoEnroll,
      };

    case AUTO_ENROLL_SUCCESS:
      return {
        ...state,
        autoEnrollError: undefined,
        enrolling: false,
      };

    case AUTO_ENROLL_ERROR:
      return {
        ...state,
        autoEnrollError: action.data,
        enrolling: false,
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
        { ...linode, backups: { ...linode.backups, enabled: true } },
      ],
    }))
    .catch((error) => {
      const reason = getErrorStringOrDefault(
        error,
        'Backups could not be enabled for this Linode.'
      );
      return {
        ...accumulator,
        errors: [...accumulator.errors, { linodeId: linode.id, reason }],
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
  const linodesWithoutBackups = getLinodesWithoutBackups(
    getState().__resources
  );

  dispatch(handleEnable());
  Bluebird.reduce(linodesWithoutBackups, gatherResponsesAndErrors, {
    errors: [],
    success: [],
  })
    .then((response) => {
      if (response.errors && !isEmpty(response.errors)) {
        dispatch(handleEnableError(response));
      } else {
        dispatch(handleEnableSuccess(response.success));
      }
      dispatch(updateMultipleLinodes(response.success));
      // Analytics Event
      sendBackupsEnabledEvent(
        `Enabled backups for ${response.success.length} Linodes`
      );
    })
    .catch(() =>
      dispatch(
        handleEnableError([
          { linodeId: 0, reason: 'There was an error enabling backups.' },
        ])
      )
    );
};

/* Dispatches an async action that will set the backups_enabled account setting.
 *  When complete, it will dispatch appropriate actions to handle the result, including
 * updating state.__resources.accountSettings.data.backups_enabled.
 */
type EnableAutoEnrollThunk = ThunkActionCreator<
  void,
  { backupsEnabled: boolean; queryClient: QueryClient }
>;
export const enableAutoEnroll: EnableAutoEnrollThunk = ({
  backupsEnabled,
  queryClient,
}) => (dispatch, getState) => {
  const state = getState();
  const { backups } = state;
  const shouldEnableBackups = Boolean(backups.autoEnroll);

  /** If the selected toggle setting matches the setting already on the user's account,
   * don't bother the API.
   */
  if (backupsEnabled === shouldEnableBackups) {
    dispatch(enableAllBackups());
    return;
  }

  dispatch(handleAutoEnroll());

  queryClient.executeMutation({
    mutationFn: updateAccountSettings,
    mutationKey: queryKey,
    onError: (errors: APIError[]) => {
      const finalError = getErrorStringOrDefault(
        errors,
        'Your account settings could not be updated. Please try again.'
      );
      dispatch(handleAutoEnrollError(finalError));
    },
    onSuccess: (data) => {
      updateAccountSettingsData(data, queryClient);
      dispatch(handleAutoEnrollSuccess());
      dispatch(enableAllBackups());
    },
    variables: { backups_enabled: shouldEnableBackups },
  });
};
