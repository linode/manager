import { prop } from 'ramda';
import { compose } from 'redux';
import { getNotifications } from 'src/services/account';
import { ThunkActionCreator } from '../types';


// TYPES
type State = RequestableData<Linode.Notification[]>;

interface Action {
  type: string;
  error?: Error;
  data?: any;
}

type ActionCreator = (...args: any[]) => Action;

// ACTIONS
export const LOAD = '@manager/notifications/LOAD'
export const ERROR = '@manager/notifications/ERROR'
export const SUCCESS = '@manager/notifications/SUCCESS'
export const UPDATE = '@manager/notifications/UPDATE'

// ACTION CREATORS
export const startRequest: ActionCreator = () => ({ type: LOAD });

export const handleError: ActionCreator = (error: Error) => ({ type: ERROR, error });

export const handleSuccess: ActionCreator = (data: Linode.Notification[]) => ({ type: SUCCESS, data });

export const handleUpdate: ActionCreator = (data: Linode.Notification[]) => ({ type: UPDATE, data });

// DEFAULT STATE
export const DEFAULT_STATE: State = {
  lastUpdated: 0,
  loading: false,
  data: [],
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


export const requestNotifications: ThunkActionCreator<void> = () => (dispatch) => {

  dispatch(startRequest());
  getNotifications()
    .then(compose(dispatch, handleSuccess, prop('data')))
    .catch(compose(dispatch, handleError));
};
