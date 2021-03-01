import { Reducer } from 'redux';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { setLargeAccount } from './accountManagement.actions';

/** State */

export interface State {
  isLargeAccount: boolean;
}

export const defaultState: State = {
  isLargeAccount: false,
};

/** Reducer */

const reducer: Reducer<State> = reducerWithInitialState(defaultState)
  .caseWithAction(setLargeAccount, (state, action) => {
    return {
      ...state,
      isLargeAccount: action.payload,
    };
  })
  .default((state) => state);

export default reducer;
