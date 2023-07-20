import { QueryClient } from 'react-query';
import { useStore } from 'react-redux';
import {
  Store,
  applyMiddleware,
  combineReducers,
  compose,
  createStore,
} from 'redux';
import thunk from 'redux-thunk';

import { State as AuthState } from 'src/store/authentication';
import authentication, {
  defaultState as authenticationDefaultState,
} from 'src/store/authentication/authentication.reducer';
import backups, {
  State as BackupDrawerState,
  defaultState as backupsDefaultState,
} from 'src/store/backupDrawer';
import events, {
  State as EventsState,
  defaultState as eventsDefaultState,
} from 'src/store/events/event.reducer';
import globalErrors, {
  State as GlobalErrorState,
  defaultState as defaultGlobalErrorState,
} from 'src/store/globalErrors';
import linodeCreateReducer, {
  State as LinodeCreateState,
  defaultState as linodeCreateDefaultState,
} from 'src/store/linodeCreate/linodeCreate.reducer';
import longviewEvents from 'src/store/longview/longview.events';
import longview, {
  State as LongviewState,
  defaultState as defaultLongviewState,
} from 'src/store/longview/longview.reducer';
import longviewStats, {
  State as LongviewStatsState,
  defaultState as defaultLongviewStatsState,
} from 'src/store/longviewStats/longviewStats.reducer';
import stackScriptDialog, {
  State as StackScriptDialogState,
  defaultState as stackScriptDialogDefaultState,
} from 'src/store/stackScriptDialog';
import volumeDrawer, {
  State as VolumeDrawerState,
  defaultState as volumeDrawerDefaultState,
} from 'src/store/volumeForm';

import featureFlagsLoad, {
  State as FeatureFlagsLoadState,
  defaultState as featureFlagsLoadState,
} from './featureFlagsLoad/featureFlagsLoad.reducer';
import initialLoad, {
  State as InitialLoadState,
  defaultState as initialLoadState,
} from './initialLoad/initialLoad.reducer';
import combineEventsMiddleware from './middleware/combineEventsMiddleware';
import mockFeatureFlags, {
  MockFeatureFlagState,
  defaultMockFeatureFlagState,
} from './mockFeatureFlags';
import pendingUpload, {
  State as PendingUploadState,
  defaultState as pendingUploadState,
} from './pendingUpload';
import { initReselectDevtools } from './selectors';

const reduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__;
initReselectDevtools();

export interface ApplicationState {
  authentication: AuthState;
  backups: BackupDrawerState;
  createLinode: LinodeCreateState;
  events: EventsState;
  featureFlagsLoad: FeatureFlagsLoadState;
  globalErrors: GlobalErrorState;
  initialLoad: InitialLoadState;
  longviewClients: LongviewState;
  longviewStats: LongviewStatsState;
  mockFeatureFlags: MockFeatureFlagState;
  pendingUpload: PendingUploadState;
  stackScriptDialog: StackScriptDialogState;
  volumeDrawer: VolumeDrawerState;
}

export const defaultState: ApplicationState = {
  authentication: authenticationDefaultState,
  backups: backupsDefaultState,
  createLinode: linodeCreateDefaultState,
  events: eventsDefaultState,
  featureFlagsLoad: featureFlagsLoadState,
  globalErrors: defaultGlobalErrorState,
  initialLoad: initialLoadState,
  longviewClients: defaultLongviewState,
  longviewStats: defaultLongviewStatsState,
  mockFeatureFlags: defaultMockFeatureFlagState,
  pendingUpload: pendingUploadState,
  stackScriptDialog: stackScriptDialogDefaultState,
  volumeDrawer: volumeDrawerDefaultState,
};

/**
 * Reducers
 */
const reducers = combineReducers<ApplicationState>({
  authentication,
  backups,
  createLinode: linodeCreateReducer,
  events,
  featureFlagsLoad,
  globalErrors,
  initialLoad,
  longviewClients: longview,
  longviewStats,
  mockFeatureFlags,
  pendingUpload,
  stackScriptDialog,
  volumeDrawer,
});

const enhancersFactory = (queryClient: QueryClient) =>
  compose(
    applyMiddleware(
      thunk,
      combineEventsMiddleware([longviewEvents], queryClient)
    ),
    reduxDevTools ? reduxDevTools() : (f: any) => f
  ) as any;

// We need an instance of the query client for some event event handlers
export const storeFactory = (queryClient: QueryClient) =>
  createStore(reducers, defaultState, enhancersFactory(queryClient));

export type ApplicationStore = Store<ApplicationState>;

export const useApplicationStore = (): ApplicationStore =>
  useStore<ApplicationState>();
