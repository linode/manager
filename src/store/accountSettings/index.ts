import { compose } from 'redux';
import { getAccountSettings, updateAccountSettings as _update } from 'src/services/account';
import { ThunkActionCreator } from 'src/store/types';

// TYPES

interface Action {
  type: string;
  error?: Error;
  data?: any;
}

type ActionCreator = (...args: any[]) => Action;

// ACTIONS
export const LOAD = '@manager/account/LOAD'
export const ERROR = '@manager/account/ERROR'
export const SUCCESS = '@manager/account/SUCCESS'
export const UPDATE = '@manager/account/UPDATE'
export const UPDATE_ERROR = '@manager/account/UPDATE_ERROR'

// ACTION CREATORS
export const startRequest: ActionCreator = () => ({ type: LOAD });

export const handleError: ActionCreator = (error: Error) => ({ type: ERROR, error });

export const handleSuccess: ActionCreator = (data: Linode.AccountSettings) => ({ type: SUCCESS, data });

export const handleUpdate: ActionCreator = (data: Linode.AccountSettings) => ({ type: UPDATE, data });

export const handleUpdateError: ActionCreator = (error: Error) => ({ type: UPDATE_ERROR, error });


// DEFAULT STATE
export const DEFAULT_STATE: AccountSettingsState = {
  lastUpdated: 0,
  loading: false,
  data: undefined,
  error: undefined,
  updateError: undefined,
};

// REDUCER
export default (state: AccountSettingsState = DEFAULT_STATE, action: Action) => {
  switch (action.type) {
    case LOAD:
      return { ...state, loading: true };

    case ERROR:
      return { ...state, loading: false, lastUpdated: Date.now(), error: action.error };

    case SUCCESS:
      return { ...state, loading: false, error: undefined, updateError: undefined, lastUpdated: Date.now(), data: action.data };

    case UPDATE:
      return { ...state, loading: false, error: undefined, updateError: undefined, lastUpdated: Date.now(), data: action.data };

    case UPDATE_ERROR:
      return { ...state, loading: false, error: undefined, lastUpdated: Date.now(), updateError: action.error }

    default:
      return state;
  }
};

export const requestAccountSettings: ThunkActionCreator<void> = () => (dispatch) => {
  dispatch(startRequest());
  getAccountSettings()
    .then(compose(dispatch, handleSuccess))
    .catch(compose(dispatch, handleError));
};

export const updateAccountSettings: ThunkActionCreator<void> = (data: Partial<Linode.AccountSettings>) => (dispatch) => {
  _update(data)
    .then(compose(dispatch, handleUpdate))
    .catch(compose(dispatch, handleUpdateError));
}
