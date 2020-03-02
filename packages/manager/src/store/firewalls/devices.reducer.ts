import produce from 'immer';
import { FirewallDevice } from 'linode-js-sdk/lib/firewalls';
import { Reducer } from 'redux';
import {
  apiResponseToMappedState,
  ensureInitializedNestedState
} from 'src/store/store.helpers';
import { isType } from 'typescript-fsa';
import { EntityError, RelationalMappedEntityState } from '../types';
import {
  addFirewallDeviceActions,
  getAllFirewallDevicesActions,
  removeFirewallDeviceActions
} from './devices.actions';

export type State = RelationalMappedEntityState<FirewallDevice, EntityError>;

export const defaultState: State = {};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  return produce(state, draft => {
    if (isType(action, getAllFirewallDevicesActions.started)) {
      const { firewallID } = action.payload;
      draft = ensureInitializedNestedState(draft, firewallID, { results: 0 });

      draft[firewallID].loading = true;
      draft[firewallID].error.read = undefined;
    }

    if (isType(action, getAllFirewallDevicesActions.done)) {
      const { result } = action.payload;
      const { firewallID } = action.payload.params;
      draft = ensureInitializedNestedState(draft, firewallID, { results: 0 });

      draft[firewallID].loading = false;
      draft[firewallID].itemsById = apiResponseToMappedState(result.data);
      draft[firewallID].lastUpdated = Date.now();
      draft[firewallID].results = result.results;
    }

    if (isType(action, getAllFirewallDevicesActions.failed)) {
      const { error } = action.payload;
      const { firewallID } = action.payload.params;

      draft = ensureInitializedNestedState(draft, firewallID, { results: 0 });

      draft[firewallID].error.read = error;
      draft[firewallID].loading = false;
    }

    if (isType(action, addFirewallDeviceActions.started)) {
      const { firewallID } = action.payload;

      draft = ensureInitializedNestedState(draft, firewallID, { results: 0 });
      draft[firewallID].error.create = undefined;
    }

    if (isType(action, addFirewallDeviceActions.done)) {
      const { result } = action.payload;
      const { firewallID } = action.payload.params;

      draft = ensureInitializedNestedState(draft, firewallID, { results: 0 });
      draft[firewallID].lastUpdated = Date.now();
      draft[firewallID].itemsById[result.id] = result;
      draft[firewallID].results = Object.keys(
        draft[firewallID].itemsById
      ).length;
    }

    if (isType(action, addFirewallDeviceActions.failed)) {
      const { error } = action.payload;
      const { firewallID } = action.payload.params;

      draft = ensureInitializedNestedState(draft, firewallID, { results: 0 });
      draft[firewallID].error.create = error;
    }

    if (isType(action, removeFirewallDeviceActions.started)) {
      const { firewallID } = action.payload;

      draft = ensureInitializedNestedState(draft, firewallID, { results: 0 });
      draft[firewallID].error.delete = undefined;
    }

    if (isType(action, removeFirewallDeviceActions.done)) {
      const { deviceID, firewallID } = action.payload.params;

      delete draft[firewallID].itemsById[deviceID];
      draft[firewallID].lastUpdated = Date.now();
      draft[firewallID].results = Object.keys(
        draft[firewallID].itemsById
      ).length;
    }

    if (isType(action, removeFirewallDeviceActions.failed)) {
      const { error } = action.payload;
      const { firewallID } = action.payload.params;

      draft = ensureInitializedNestedState(draft, firewallID, { results: 0 });
      draft[firewallID].error.delete = error;
    }
  });
};

export default reducer;
