import { Reducer } from "redux";
import { getAllVolumes } from "src/store/volumes/volumes.requests";
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
  if(isType(action, getAllVolumes.started)){
    return onStart(state);
  }

  if(isType(action, getAllVolumes.done)){
    const {result} = action.payload;
    return onGetAllSuccess(result, state);
  }

  if(isType(action, getAllVolumes.failed)){}

  return state;
};

export default reducer;
