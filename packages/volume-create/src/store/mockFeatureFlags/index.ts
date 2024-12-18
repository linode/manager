import { Reducer } from 'redux';
import actionCreatorFactory, { isType } from 'typescript-fsa';

import { FlagSet } from 'src/featureFlags';

const actionCreator = actionCreatorFactory(
  '@@manager/mock-feature-flags'
);

export const setMockFeatureFlags = actionCreator<Partial<FlagSet>>(
  'SET_MOCK_FEATURE_FLAGS'
);

export type MockFeatureFlagState = Partial<FlagSet>;

export const defaultMockFeatureFlagState: MockFeatureFlagState = {};

const reducer: Reducer<MockFeatureFlagState> = (
  state = defaultMockFeatureFlagState,
  action
) => {
  if (isType(action, setMockFeatureFlags)) {
    return {
      ...state,
      ...action.payload,
    };
  }
  return state;
};

export default reducer;
