import produce from 'immer';
import { AccountSettings } from 'linode-js-sdk/lib/account';
import { isType } from 'typescript-fsa';
import { RequestableData } from '../types';
import {
  Action,
  ERROR,
  LOAD,
  SUCCESS,
  UPDATE,
  UPDATE_ERROR,
  updateSettingsInStore
} from './accountSettings.actions';

export type State = RequestableData<AccountSettings> & {
  updateError?: Linode.ApiFieldError[];
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
// @todo Update this to current patterns.
export default (state: State = defaultState, action: Action) => {
  if (isType(action, updateSettingsInStore)) {
    const settings = action.payload;
    return produce(state, draft => {
      draft.data = { ...state.data!, ...settings }; // data shouldn't be initialized as undefined...
    });
  }

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
