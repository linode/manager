import actionCreatorFactory, { isType } from 'typescript-fsa';
import { Reducer } from 'redux';

export type MockDataOption = 'linode';

export const actionCreator = actionCreatorFactory('@@manager/mock-data');

export const addMockData = actionCreator<{
  key: MockDataOption;
  value: number;
}>('ADD');

export const removeMockData = actionCreator<MockDataOption>('REMOVE');

export type MockDataState = Partial<Record<MockDataOption, number>>;

export const defaultMockDataState: MockDataState = {};

export const reducer: Reducer<MockDataState> = (
  state = defaultMockDataState,
  action
) => {
  if (isType(action, addMockData)) {
    return {
      ...state,
      [action.payload.key]: action.payload.value
    };
  }
  if (isType(action, removeMockData)) {
    delete state[action.payload];
    return state;
  }
  return state;
};

export default reducer;
