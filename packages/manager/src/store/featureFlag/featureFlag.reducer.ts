import { Reducer } from 'redux';
import { MAX_PAGE_SIZE } from 'src/constants';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { setMaxPageSize } from './featureFlag.actions';

export interface State {
  maxPageSize: number;
}

export const defaultState: State = {
  maxPageSize: MAX_PAGE_SIZE
};

const reducer: Reducer<State> = reducerWithInitialState(
  defaultState
).caseWithAction(setMaxPageSize, (state, action) => {
  const { payload } = action;

  return {
    ...state,
    maxPageSize: payload
  };
});

export default reducer;
