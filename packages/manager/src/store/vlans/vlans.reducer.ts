import { VLAN } from '@linode/api-v4/lib/vlans';
import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import {
  createDefaultState,
  onCreateOrUpdate,
  onDeleteSuccess,
  onError,
  onGetAllSuccess,
  onStart,
  setError
} from '../store.helpers.tmp';
import { MappedEntityState2 as MappedEntityState } from '../types';
import {
  createVlanActions,
  deleteVlanActions,
  getVlansActions,
  attachVlanActions,
  detachVlanActions
} from './vlans.actions';

export type State = MappedEntityState<VLAN>;

export const defaultState: State = createDefaultState();

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, getVlansActions.started)) {
    return onStart(state);
  }

  if (isType(action, getVlansActions.done)) {
    const { result } = action.payload;
    return onGetAllSuccess(result.data, state, result.results);
  }

  if (isType(action, getVlansActions.failed)) {
    const { error } = action.payload;

    return onError({ read: error }, state);
  }

  if (isType(action, createVlanActions.started)) {
    return setError({ create: undefined }, state);
  }

  if (isType(action, createVlanActions.done)) {
    const newVlan = action.payload.result;
    return onCreateOrUpdate(newVlan, state);
  }

  if (isType(action, createVlanActions.failed)) {
    const { error } = action.payload;

    return onError({ create: error }, state);
  }

  if (
    isType(action, attachVlanActions.started) ||
    isType(action, detachVlanActions.started)
  ) {
    return setError({ update: undefined }, state);
  }

  if (
    isType(action, attachVlanActions.done) ||
    isType(action, detachVlanActions.done)
  ) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (
    isType(action, attachVlanActions.failed) ||
    isType(action, detachVlanActions.failed)
  ) {
    const { error } = action.payload;

    return onError({ update: error }, state);
  }

  if (isType(action, deleteVlanActions.started)) {
    return setError({ delete: undefined }, state);
  }

  if (isType(action, deleteVlanActions.done)) {
    const { vlanID } = action.payload.params;
    return onDeleteSuccess(vlanID, state);
  }

  if (isType(action, deleteVlanActions.failed)) {
    const { error } = action.payload;

    return onError({ delete: error }, state);
  }

  return state;
};

export default reducer;
