import { Notification } from 'linode-js-sdk/lib/account';
import { Reducer } from 'redux';
import { RequestableData } from 'src/store/types';
import { Action, ERROR, LOAD, SUCCESS, UPDATE } from './notification.actions';

export type State = RequestableData<Notification[]>;

export const defaultState: State = {
  lastUpdated: 0,
  loading: false,
  data: undefined,
  error: undefined
};

const reducer: Reducer<State> = (
  state: State = defaultState,
  action: Action
) => {
  switch (action.type) {
    case LOAD:
      return { ...state, loading: true };

    case ERROR:
      return {
        ...state,
        loading: false,
        lastUpdated: Date.now(),
        error: action.error
      };

    case SUCCESS:
      return {
        ...state,
        loading: false,
        lastUpdated: Date.now(),
        data: action.data
      };

    case UPDATE:
      return {
        ...state,
        loading: false,
        lastUpdated: Date.now(),
        data: action.data
      };

    default:
      return state;
  }
};

export default reducer;
