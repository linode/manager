import { Reducer } from 'redux';
import { MAX_PAGE_SIZE } from 'src/constants';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { setPageSize } from './featureFlag.actions';

export interface State {
  pageSize: number;
}

export const defaultState: State = {
  pageSize: MAX_PAGE_SIZE
};

const reducer: Reducer<State> = reducerWithInitialState(
  defaultState
).caseWithAction(setPageSize, (state, action) => {
  const { payload } = action;

  return {
    ...state,
    pageSize: payload
  };
});

export default reducer;
