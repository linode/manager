import { Reducer } from 'redux';
import { RequestableData } from 'src/store/types';
import { isType } from 'typescript-fsa';
import {
  profileRequest,
  profileRequestFail,
  profileRequestSuccess
} from './account.actions';

/**
 * State
 */
export type State = RequestableData<Linode.Account>;

export const defaultState: State = {
  loading: false,
  error: undefined,
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

    return { ...state, loading: false, data: payload, lastUpdated: Date.now() };
  }

  if (isType(action, profileRequestFail)) {
    const { payload } = action;

    return { ...state, loading: false, error: payload };
  }

  return state;
};

export default reducer;
