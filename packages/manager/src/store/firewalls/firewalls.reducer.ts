import produce from 'immer';
import { Firewall } from 'linode-js-sdk/lib/firewalls';
import { Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import { apiResponseToMappedState } from '../store.helpers';
import { EntitiesAsObjectState } from '../types';
import {
  createFirewallActions,
  deleteFirewallActions,
  getFirewalls,
  updateFirewallActions
} from './firewalls.actions';

export type State = EntitiesAsObjectState<Firewall>;

export const defaultState: State = {
  loading: false,
  lastUpdated: 0,
  results: 0,
  data: {},
  error: {}
};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  return produce(state, draft => {
    if (isType(action, getFirewalls.started)) {
      draft.loading = true;
    }

    if (isType(action, getFirewalls.done)) {
      const { result } = action.payload;
      const data = apiResponseToMappedState<Firewall>(result.data);
      draft.loading = false;
      draft.lastUpdated = Date.now();
      draft.data = data;
      draft.results = result.results;
    }

    if (isType(action, getFirewalls.failed)) {
      const { error } = action.payload;

      draft.loading = false;
      draft.error.read = error;
    }

    if (isType(action, createFirewallActions.started)) {
      draft.error.create = undefined;
    }

    if (isType(action, createFirewallActions.done)) {
      const newFirewall = action.payload.result;
      draft.data[newFirewall.id] = newFirewall;
      draft.results++;
      draft.lastUpdated = Date.now();
    }

    if (isType(action, createFirewallActions.failed)) {
      const { error } = action.payload;

      draft.error.create = error;
    }

    if (isType(action, updateFirewallActions.started)) {
      draft.error.update = undefined;
    }

    if (isType(action, updateFirewallActions.done)) {
      const { result } = action.payload;
      draft.data[result.id] = result;
      draft.lastUpdated = Date.now();
    }

    if (isType(action, updateFirewallActions.failed)) {
      const { error } = action.payload;

      draft.error.update = error;
    }

    if (isType(action, deleteFirewallActions.started)) {
      draft.error.delete = undefined;
    }

    if (isType(action, deleteFirewallActions.done)) {
      const { firewallID } = action.payload.params;
      delete draft.data[firewallID];
      draft.results--;
      draft.lastUpdated = Date.now();
    }

    if (isType(action, deleteFirewallActions.failed)) {
      const { error } = action.payload;

      draft.error.delete = error;
    }
  });
};

export default reducer;
