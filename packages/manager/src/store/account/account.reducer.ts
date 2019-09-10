import produce from 'immer';
import { Account } from 'linode-js-sdk/lib/account';
import { Reducer } from 'redux';
import { RequestableDataWithEntityError } from 'src/store/types';
import { isType } from 'typescript-fsa';
import {
  profileRequest,
  profileRequestFail,
  profileRequestSuccess,
  updateAccountActions
} from './account.actions';

/**
 * State
 */
export type State = RequestableDataWithEntityError<Account>;

export const defaultState: State = {
  loading: false,
  error: {},
  lastUpdated: 0,
  data: undefined
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state: State = defaultState, action) => {
  return produce(state, draft => {
    if (isType(action, profileRequest)) {
      draft.loading = true;
    }

    if (isType(action, profileRequestSuccess)) {
      const { payload } = action;

      draft.loading = false;
      draft.data = payload;
      draft.lastUpdated = Date.now();
    }

    if (isType(action, profileRequestFail)) {
      const { payload } = action;

      draft.loading = false;
      draft.error.read = payload;
    }

    if (isType(action, updateAccountActions.started)) {
      draft.loading = true;
      draft.error.update = undefined;
    }

    if (isType(action, updateAccountActions.done)) {
      const { result } = action.payload;

      draft.loading = false;
      draft.data = result;
      draft.lastUpdated = Date.now();
      draft.error.update = undefined;
      draft.error.read = undefined;
    }

    if (isType(action, updateAccountActions.failed)) {
      const { error } = action.payload;

      draft.loading = false;
      draft.error.update = error;
    }
  });
};

export default reducer;
