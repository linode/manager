import { compose, Dispatch } from 'redux';

import { getMyGrants, getProfile } from 'src/services/profile';


// TYPES
type State = RequestableData<Linode.Profile>;

interface Action {
  type: string;
  error?: Error;
  data?: any;
}

type ActionCreator = (...args: any[]) => Action;

// ACTIONS
export const LOAD = '@manager/profile/LOAD'
export const ERROR = '@manager/profile/ERROR'
export const SUCCESS = '@manager/profile/SUCCESS'
export const UPDATE = '@manager/profile/UPDATE'

// ACTION CREATORS
export const startRequest: ActionCreator = () => ({ type: LOAD });

export const handleError: ActionCreator = (error: Error) => ({ type: ERROR, error });

export const handleSuccess: ActionCreator = (data: Linode.Profile) => ({ type: SUCCESS, data });

export const handleUpdate: ActionCreator = (data: Linode.Profile) => ({ type: UPDATE, data });

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

const maybeRequestGrants: (response: Linode.Profile) => Promise<Linode.Profile>
  = (profile) => {
    if (profile.restricted === false) {
      return Promise.resolve(profile);
    }

    return getMyGrants()
      .then(grants => ({ ...profile, grants }));
  };

export const requestProfile = () => (dispatch: Dispatch<State>) => {

  dispatch(startRequest());
  getProfile()
    .then(maybeRequestGrants)
    .then(compose(dispatch, handleSuccess))
    .catch(compose(dispatch, handleError));
};
