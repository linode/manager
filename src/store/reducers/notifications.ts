import { prop } from 'ramda';
import { compose, Dispatch } from 'redux';

import { getNotifications } from 'src/services/account';

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

// FAKE NOTIFICATION
const hardCodedNotifications = [
  {
    "entity": {
      "url": "/linode/instances/fake_linode",
      "label": "test-linode",
      "type": "linode",
      "id": 1
    },
    "type": "maintenance",
    "until": null,
    "label": "",
    "severity": "major",
    "body": "",
    "when": null,
    "message": "Maintenance is required for one or more of your Linodes. Your maintenance time is 2018-11-30 14:00:00. Please see status.linode.com for additional information. THIS TEXT IS HARDCODED AND WILL CHANGE."
  }
];

// REDUCER
export default (state: State = DEFAULT_STATE, action: Action) => {
  switch (action.type) {
    case LOAD:
      return { ...state, loading: true };

    case ERROR:
      return { ...state, loading: false, lastUpdated: Date.now(), error: action.error };

    case SUCCESS:

      /*  Uncomment the following line for production */
      // return { ...state, loading: false, lastUpdated: Date.now(), data: action.data };

      /* Remove the following line for production */
      return { ...state, loading: false, lastUpdated: Date.now(), data: [...hardCodedNotifications, ...action.data ]};

    case UPDATE:
      return { ...state, loading: false, lastUpdated: Date.now(), data: action.data };

    default:
      return state;
  }
};


export const requestNotifications = () => (dispatch: Dispatch<State>) => {

  dispatch(startRequest());
  getNotifications()
    .then(compose(dispatch, handleSuccess, prop('data')))
    .catch(compose(dispatch, handleError));
};
