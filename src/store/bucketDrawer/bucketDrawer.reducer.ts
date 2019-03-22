import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import { closeBucketDrawer, openBucketDrawer } from './bucketDrawer.actions';

export interface State {
  isOpen: boolean;
}

export const defaultState: State = {
  isOpen: false
};

export const reducer: Reducer<State> = (state = defaultState, action) => {
  // OPEN
  if (isType(action, openBucketDrawer)) {
    return {
      ...state,
      isOpen: true
    };
  }

  // CLOSE
  if (isType(action, closeBucketDrawer)) {
    return {
      ...state,
      isOpen: false
    };
  }

  return state;
};

export default reducer;
