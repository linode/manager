import { Reducer } from "redux";
import { getAllVolumesActions } from "src/store/volumes/volumes.requests";
import { isType } from 'typescript-fsa';
import { createDefaultState, onGetAllSuccess, onStart } from '../request/request.helpers';

/**
 * State
 */
type State = ApplicationState['__resources']['volumes'];

export const defaultState: State = createDefaultState();

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  if(isType(action, getAllVolumesActions.started)){
    return onStart(state);
  }

  if(isType(action, getAllVolumesActions.done)){
    const {result} = action.payload;
    return onGetAllSuccess(result, state);
  }

  if(isType(action, getAllVolumesActions.failed)){}

  return state;
};

export default reducer;
