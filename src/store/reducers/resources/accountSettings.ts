import { compose, Dispatch } from 'redux';

import { getAccountSettings } from 'src/services/account';

// TYPES
type State = RequestableData<Linode.AccountSettings>;

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

// ACTION CREATORS
export const startRequest: ActionCreator = () => ({ type: LOAD });

export const handleError: ActionCreator = (error: Error) => ({ type: ERROR, error });

export const handleSuccess: ActionCreator = (data: Linode.AccountSettings) => ({ type: SUCCESS, data });

export const handleUpdate: ActionCreator = (data: Linode.AccountSettings) => ({ type: UPDATE, data });

// DEFAULT STATE
export const DEFAULT_STATE: State = {
  lastUpdated: 0,
  loading: false,
  data: undefined,
  error: undefined,
};

// REDUCER
export default (state: State = DEFAULT_STATE, action: Action) => {
  switch (action.type) {
    case LOAD:
      return { ...state, loading: true };

    case ERROR:
      return { ...state, loading: false, lastUpdated: Date.now(), error: action.error };

    case SUCCESS:
      return { ...state, loading: false, lastUpdated: Date.now(), data: action.data };

    case UPDATE:
      return { ...state, loading: false, lastUpdated: Date.now(), data: action.data };

    default:
      return state;
  }
};


export const requestAccountSettings = () => (dispatch: Dispatch<State>) => {
  dispatch(startRequest());
  getAccountSettings()
    .then(compose(dispatch, handleSuccess))
    .catch(compose(dispatch, handleError));
};
