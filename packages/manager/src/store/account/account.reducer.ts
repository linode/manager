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
export type State = RequestableDataWithEntityError<Linode.Account>;

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
  if (isType(action, profileRequest)) {
    return { ...state, loading: true };
  }

  if (isType(action, profileRequestSuccess)) {
    const { payload } = action;

    return {
      ...state,
      loading: false,
      data: payload,
      lastUpdated: Date.now()
    };
  }

  if (isType(action, profileRequestFail)) {
    const { payload } = action;

    return {
      ...state,
      loading: false,
      error: { ...state.error, read: payload }
    };
  }

  if (isType(action, updateAccountActions.started)) {
    return {
      ...state,
      loading: true,
      error: { ...state.error, update: undefined }
    };
  }

  if (isType(action, updateAccountActions.done)) {
    const { result } = action.payload;

    return {
      ...state,
      loading: false,
      data: result,
      lastUpdated: Date.now(),
      error: { ...state.error, update: undefined, read: undefined }
    };
  }

  if (isType(action, updateAccountActions.failed)) {
    const { error } = action.payload;

    return {
      ...state,
      loading: false,
      error: {
        ...state.error,
        update: error
      }
    };
  }

  return state;
};

export default reducer;
