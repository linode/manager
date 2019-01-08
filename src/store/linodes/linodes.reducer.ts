import { Reducer } from "redux";
import { updateLinodeInStore } from "src/store/linodes/linodes.actions";
import { isType } from 'typescript-fsa';
import { createDefaultState, onCreateSuccess, onDeleteSuccess, onGetAllSuccess, onStart, onUpdateSuccess, updateInPlace } from '../request/request.helpers';
import { createLinode, deleteLinode, getAllLinodes, getLinode, updateLinode } from './linodes.requests';

/**
 * State
 */
type State = ApplicationState['__resources']['linodes'];

export const defaultState: State = createDefaultState();

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  /** Create */
  if (isType(action, createLinode.done)) {
    const { result } = action.payload;

    return onCreateSuccess(result, state);
  }

  /** Read */
  if (isType(action, getLinode.done)) {
    const { result } = action.payload;

    return onUpdateSuccess(result, state);
  }

  /** Update */
  if (isType(action, updateLinode.done)) {
    const { result } = action.payload;

    return onUpdateSuccess(result, state);
  }

  /** Delete */
  if (isType(action, deleteLinode.done)) {
    const { params } = action.payload;

    return onDeleteSuccess(params.id, state);
  }

  /** Get all Linodes */
  if (isType(action, getAllLinodes.started)) {
    return onStart(state);
  }

  if (isType(action, getAllLinodes.done)) {
    const { result } = action.payload;

    return onGetAllSuccess(result, state);
  }

  if (isType(action, getAllLinodes.failed)) { console.error(action.payload.error) }

  /** Synchronous update in place. */
  if (isType(action, updateLinodeInStore)) {
    const { id, update } = action.payload;

    return updateInPlace(id, update, state);
  }

  return state
};

export default reducer;
