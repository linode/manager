import { Reducer } from 'redux';
import actionCreatorFactory, { isType } from 'typescript-fsa';

const actionCreator = actionCreatorFactory('@@manager/pending-upload');

const setPendingUpload = actionCreator<boolean>('set-pending-upload');

export type State = boolean;
export const defaultState: State = false;

const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, setPendingUpload)) {
    return action.payload;
  }
  return state;
};

export default reducer;
