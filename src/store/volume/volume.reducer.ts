import { Reducer } from 'redux';
import { MappedEntityState } from 'src/store/types';
import { isType } from 'typescript-fsa';
import { createDefaultState, onError, onGetAllSuccess, onStart } from "../store.helpers";
import { getAllVolumesActions } from './volume.actions';


export type State = MappedEntityState<Linode.Volume>;

export const defaultState: State = createDefaultState<Linode.Volume>();

const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, getAllVolumesActions.started)) {
    return onStart(state);
  }

  if (isType(action, getAllVolumesActions.done)) {
    const { result } = action.payload;
    return onGetAllSuccess(result, state);
  }

  if (isType(action, getAllVolumesActions.failed)) {
    const { error } = action.payload;
    return onError(error, state)
  }

  return state;
}

export default reducer;
