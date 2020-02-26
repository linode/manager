// import produce from 'immer';
// import { Firewall, FirewallDevice } from 'linode-js-sdk/lib/firewalls';
// import { Reducer } from 'redux';
// import { isType } from 'typescript-fsa';
// import {
//   ensureInitializedNestedState,
//   onCreateOrUpdate,
//   onDeleteSuccess,
//   onError,
//   onGetAllSuccess,
//   onStart
// } from 'src/store/store.helpers';
// import { Entity, EntityError, RelationalDataSet } from '../types';
// import {
//   addFirewallDeviceActions,
//   getAllFirewallDevicesActions,
//   removeFirewallDeviceActions
// } from './devices.actions';

// export type State = RelationalDataSet<FirewallDevice[], EntityError>;

// export const defaultState: State = {};

// /**
//  * Reducer
//  */
// const reducer: Reducer<State> = (state = defaultState, action) => {
//   return produce(state, draft => {
//     if (isType(action, getAllFirewallDevicesActions.started)) {
//       const { firewallID } = action.payload;
//       draft = ensureInitializedNestedState(draft, firewallID);

//       draft[firewallID] = onStart(draft[firewallID]);
//     }

//     if (isType(action, getAllFirewallDevicesActions.done)) {
//       const { result } = action.payload;
//       const { firewallID } = action.payload.params;
//       draft = ensureInitializedNestedState(draft, firewallID);

//       draft[firewallID].loading = false;
//       draft[firewallID].data = result;
//       draft[firewallID].lastUpdated = Date.now();
//     }

//     if (isType(action, getAllFirewallDevicesActions.failed)) {
//       const { error } = action.payload;
//       const { firewallID } = action.payload.params;

//       draft = ensureInitializedNestedState(draft, firewallID);

//       draft[firewallID].error.read = error;
//     }

//     if (isType(action, addFirewallDeviceActions.done)) {
//       const { result } = action.payload;
//     }
//   });
// };

// export default reducer;
