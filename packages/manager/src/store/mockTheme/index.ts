import { Reducer } from 'redux';
import actionCreatorFactory, { isType } from 'typescript-fsa';

import type { ThemeSelectionOptions } from 'src/dev-tools/ThemeSelector';

export type MockTheme = ThemeSelectionOptions['value'];

export const actionCreator = actionCreatorFactory('@@manager/mock-theme');

export const setMockTheme = actionCreator<MockTheme>('SET_MOCK_THEME');

export const defaultMockTheme: MockTheme = 'system';

export const reducer: Reducer<MockTheme> = (
  state = defaultMockTheme,
  action
) => {
  if (isType(action, setMockTheme)) {
    return action.payload;
  }
  return state;
};

export default reducer;
