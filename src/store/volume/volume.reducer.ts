import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import { createDefaultState, onGetAllSuccess, onStart } from "../store.helpers";
import { getAllVolumesActions as actions } from './volume.actions';


type State = ApplicationState['__resources']['volumes'];

export const defaultState: State = createDefaultState<Linode.Volume>();

const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, actions.started)) {
    return onStart(state);
  }

  if (isType(action, actions.done)) {
    const { result } = action.payload;
    return onGetAllSuccess(result, state);
  }

  if (isType(action, actions.failed)) {
    // @todo: What to do here?
  }

  return state;
}

export default reducer;