import { Reducer } from 'redux';
import {
  addMany,
  createDefaultState,
  onCreateOrUpdate,
  onDeleteSuccess,
  onError,
  onGetAllSuccess,
  onStart
} from 'src/store/store.helpers';
import { MappedEntityState } from 'src/store/types';
import { isType } from 'typescript-fsa';
import {
  createLinodeConfigActions,
  deleteLinodeConfigActions,
  getAllLinodeConfigsActions,
  getLinodeConfigActions,
  getLinodeConfigsActions,
  updateLinodeConfigActions
} from './config.actions';
import { Entity } from './config.types';

export type State = MappedEntityState<Entity>;

export const defaultState: State = createDefaultState<Entity>();

const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, getLinodeConfigsActions.done)) {
    const { result } = action.payload;
    return addMany(result, state);
  }

  if (isType(action, createLinodeConfigActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, getLinodeConfigActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, updateLinodeConfigActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, deleteLinodeConfigActions.done)) {
    const {
      params: { configId }
    } = action.payload;

    return onDeleteSuccess(configId, state);
  }

  if (isType(action, getAllLinodeConfigsActions.started)) {
    return onStart(state);
  }

  if (isType(action, getAllLinodeConfigsActions.done)) {
    const { result } = action.payload;
    return onGetAllSuccess(result, state);
  }

  if (isType(action, getAllLinodeConfigsActions.failed)) {
    const { error } = action.payload;
    return onError(error, state);
  }

  return state;
};

export default reducer;
