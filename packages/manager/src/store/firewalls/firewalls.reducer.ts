import { Firewall } from '@linode/api-v4/lib/firewalls';
import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import {
  createDefaultState,
  onCreateOrUpdate,
  onDeleteSuccess,
  onError,
  onGetAllSuccess,
  onStart,
  setError,
} from '../store.helpers.tmp';
import { MappedEntityState2 as MappedEntityState } from '../types';
import {
  createFirewallActions,
  deleteFirewallActions,
  getFirewalls,
  updateFirewallActions,
  updateFirewallRulesActions,
} from './firewalls.actions';

export type State = MappedEntityState<Firewall>;

export const defaultState: State = createDefaultState();

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  if (isType(action, getFirewalls.started)) {
    return onStart(state);
  }

  if (isType(action, getFirewalls.done)) {
    const { result } = action.payload;
    return onGetAllSuccess(result.data, state, result.results);
  }

  if (isType(action, getFirewalls.failed)) {
    const { error } = action.payload;

    return onError({ read: error }, state);
  }

  if (isType(action, createFirewallActions.started)) {
    return setError({ create: undefined }, state);
  }

  if (isType(action, createFirewallActions.done)) {
    const newFirewall = action.payload.result;
    return onCreateOrUpdate(newFirewall, state);
  }

  if (isType(action, createFirewallActions.failed)) {
    const { error } = action.payload;

    return onError({ create: error }, state);
  }

  if (
    isType(action, updateFirewallActions.started) ||
    isType(action, updateFirewallRulesActions.started)
  ) {
    return setError({ update: undefined }, state);
  }

  if (isType(action, updateFirewallActions.done)) {
    const { result } = action.payload;
    return onCreateOrUpdate(result, state);
  }

  if (isType(action, updateFirewallRulesActions.done)) {
    const { result, params } = action.payload;
    let firewall = state.itemsById[params.firewallID];
    firewall = { ...firewall, rules: result };
    return onCreateOrUpdate(firewall, state);
  }

  if (
    isType(action, updateFirewallActions.failed) ||
    isType(action, updateFirewallRulesActions.failed)
  ) {
    const { error } = action.payload;

    return onError({ update: error }, state);
  }

  if (isType(action, deleteFirewallActions.started)) {
    return setError({ delete: undefined }, state);
  }

  if (isType(action, deleteFirewallActions.done)) {
    const { firewallID } = action.payload.params;
    return onDeleteSuccess(firewallID, state);
  }

  if (isType(action, deleteFirewallActions.failed)) {
    const { error } = action.payload;

    return onError({ delete: error }, state);
  }

  return state;
};

export default reducer;
