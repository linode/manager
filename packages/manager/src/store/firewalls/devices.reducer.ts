import produce from 'immer';
import { FirewallDevice } from '@linode/api-v4/lib/firewalls';
import { Reducer } from 'redux';
import {
  ensureInitializedNestedState,
  onCreateOrUpdate,
  onDeleteSuccess,
  onError,
  onGetAllSuccess,
  onStart,
} from 'src/store/store.helpers.tmp';
import { isType } from 'typescript-fsa';
import { EntityError, RelationalMappedEntityState } from '../types';
import {
  addFirewallDeviceActions,
  getAllFirewallDevicesActions,
  removeFirewallDeviceActions,
} from './devices.actions';

export type State = RelationalMappedEntityState<FirewallDevice, EntityError>;

export const defaultState: State = {};

/**
 * Reducer
 */
const reducer: Reducer<State> = (state = defaultState, action) => {
  return produce(state, (draft) => {
    if (isType(action, getAllFirewallDevicesActions.started)) {
      const { firewallID } = action.payload;
      draft = ensureInitializedNestedState(draft, firewallID, { results: 0 });

      draft[firewallID] = onStart(draft[firewallID]);
    }

    if (isType(action, getAllFirewallDevicesActions.done)) {
      const { result } = action.payload;
      const { firewallID } = action.payload.params;
      draft = ensureInitializedNestedState(draft, firewallID, { results: 0 });

      draft[firewallID] = onGetAllSuccess(
        result.data,
        draft[firewallID],
        result.results
      );
    }

    if (isType(action, getAllFirewallDevicesActions.failed)) {
      const { error } = action.payload;
      const { firewallID } = action.payload.params;

      draft = ensureInitializedNestedState(draft, firewallID, { results: 0 });

      draft[firewallID] = onError({ read: error }, draft[firewallID]);
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
      draft[firewallID] = onCreateOrUpdate(result, draft[firewallID]);
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

      draft[firewallID] = onDeleteSuccess(deviceID, draft[firewallID]);
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
