import produce from 'immer';
import { AccountSettings } from 'linode-js-sdk/lib/account';
import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import { RequestableDataWithEntityError } from '../types';
import {
  requestAccountSettingsActions,
  updateAccountSettingsActions,
  updateSettingsInStore
} from './accountSettings.actions';

export type State = RequestableDataWithEntityError<AccountSettings> & {
  updateError?: Linode.ApiFieldError[];
};

// DEFAULT STATE
export const defaultState: State = {
  lastUpdated: 0,
  loading: false,
  data: undefined,
  error: {}
};

// REDUCER
export const reducer: Reducer<State> = (state = defaultState, action) => {
  return produce(state, draft => {
    if (isType(action, updateSettingsInStore)) {
      const settings = action.payload;
      draft.data = { ...state.data!, ...settings };
    }

    if (isType(action, requestAccountSettingsActions.started)) {
      draft.loading = true;
      draft.error.read = undefined;
    }

    if (isType(action, requestAccountSettingsActions.done)) {
      const { result } = action.payload;
      draft.loading = false;
      draft.lastUpdated = Date.now();
      draft.data = result;
    }

    if (isType(action, requestAccountSettingsActions.failed)) {
      const { error } = action.payload;
      draft.loading = false;
      draft.error.read = error;
    }

    if (isType(action, updateAccountSettingsActions.started)) {
      draft.error.update = undefined;
    }

    if (isType(action, updateAccountSettingsActions.done)) {
      const { result } = action.payload;
      draft.data = result;
      draft.lastUpdated = Date.now();
    }

    if (isType(action, updateAccountSettingsActions.failed)) {
      const { error } = action.payload;
      draft.error.update = error;
    }
  });
};

export default reducer;
