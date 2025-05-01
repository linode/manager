import actionCreatorFactory, { isType } from 'typescript-fsa';

import type { Reducer } from 'redux';

export const actionCreator = actionCreatorFactory('@@manager/pending-upload');

export const setPendingUpload = actionCreator<boolean>('set-pending-upload');

export type State = boolean;
export const defaultState: State = false;

export const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, setPendingUpload)) {
    return action.payload;
  }
  return state;
};

export default reducer;
