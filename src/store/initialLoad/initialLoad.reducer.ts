import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { handleLoadingDone } from './initialLoad.actions';

export interface State {
  appIsLoading: boolean;
  loadingText: string;
}

export const defaultState: State = {
  appIsLoading: true,
  loadingText: ''
};

const reducer = reducerWithInitialState(defaultState)
  .case(handleLoadingDone, state => ({
    ...state,
    appIsLoading: false
  }))
  .default(state => state);

export default reducer;
