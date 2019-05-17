import { RequestableData } from '../types';
import {
  Action,
  ERROR,
  LOAD,
  SUCCESS,
  UPDATE,
  UPDATE_ERROR
} from './accountSettings.actions';

export type State = RequestableData<Linode.AccountSettings> & {
  updateError?: Error;
};

// DEFAULT STATE
export const defaultState: State = {
  lastUpdated: 0,
  loading: false,
  data: undefined,
  error: undefined,
  updateError: undefined
};

// REDUCER
export default (state: State = defaultState, action: Action) => {
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
        error: undefined,
        updateError: undefined,
        lastUpdated: Date.now(),
        data: action.data
      };

    case UPDATE:
      return {
        ...state,
        loading: false,
        error: undefined,
        updateError: undefined,
        lastUpdated: Date.now(),
        data: action.data
      };

    case UPDATE_ERROR:
      return {
        ...state,
        loading: false,
        error: undefined,
        lastUpdated: Date.now(),
        updateError: action.error
      };

    default:
      return state;
  }
};
