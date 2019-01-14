import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import { profileRequest, profileRequestFail, profileRequestSuccess } from './account.actions';

/**
 * State
 */
type State = ApplicationState['__resources']['account'];

export const DEFAULT_STATE: State = {
  loading: false,
  error: undefined,
  lastUpdated: 0,
  data: undefined,
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state: State = DEFAULT_STATE, action) => {
  if (isType(action, profileRequest)) {
    return { ...state, loading: true }
  }

  if (isType(action, profileRequestSuccess)) {
    const { payload } = action;

    return { ...state, loading: false, data: payload, lastUpdated: Date.now() }
  }

  if (isType(action, profileRequestFail)) {
    const { payload } = action;

    return { ...state, loading: false, error: payload }
  }

  return state;
};

export default reducer;