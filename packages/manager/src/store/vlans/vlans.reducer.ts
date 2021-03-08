import { VLAN } from '@linode/api-v4/lib/vlans';
import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import {
  createDefaultState,
  onError,
  onGetAllSuccess,
  onStart,
} from '../store.helpers.tmp';
import { MappedEntityState2 as MappedEntityState } from '../types';
import { getVlansActions } from './vlans.actions';

export type State = MappedEntityState<VLAN>;

export const defaultState: State = createDefaultState();

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action: any) => {
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
  return state;
};

export default reducer;
