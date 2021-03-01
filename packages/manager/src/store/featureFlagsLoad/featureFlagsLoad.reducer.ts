import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { setFeatureFlagsLoaded } from './featureFlagsLoad.actions';

export interface State {
  featureFlagsLoading: boolean;
}

export const defaultState: State = {
  featureFlagsLoading: true,
};

const reducer = reducerWithInitialState(defaultState)
  .case(setFeatureFlagsLoaded, () => ({
    featureFlagsLoading: false,
  }))
  .default((state) => state);

export default reducer;
