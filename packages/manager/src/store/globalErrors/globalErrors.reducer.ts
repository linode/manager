import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { clearErrors, setErrors } from './globalErrors.actions';

import type { State } from './types';
import type { Reducer } from 'redux';

export const defaultState: State = {};

const reducer: Reducer<State> = reducerWithInitialState(defaultState)
  .case(setErrors, (state, payload) => {
    return payload
      ? {
          ...state,
          ...payload,
        }
      : {};
  })
  .case(clearErrors, (state, payload) => {
    /**
     * if a payload exists, only clear the specified
     * errors. If not, clear it all.
     */
    return payload
      ? {
          ...state,
          ...payload,
        }
      : {};
  })
  .default((state) => state);

export default reducer;
