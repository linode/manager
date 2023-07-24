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
import globalErrors, {
  State as GlobalErrorState,
  defaultState as defaultGlobalErrorState,
} from 'src/store/globalErrors';
import linodeCreateReducer, {
  State as LinodeCreateState,
  defaultState as linodeCreateDefaultState,
} from 'src/store/linodeCreate/linodeCreate.reducer';
import linodeConfigs, {
  State as LinodeConfigsState,
  defaultState as defaultLinodeConfigsState,
} from 'src/store/linodes/config/config.reducer';
import linodeDisks, {
  State as LinodeDisksState,
  defaultState as defaultLinodeDisksState,
} from 'src/store/linodes/disk/disk.reducer';
import linodes, {
  State as LinodesState,
  defaultState as defaultLinodesState,
} from 'src/store/linodes/linodes.reducer';
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

/**
 * Default State
 */
const __resourcesDefaultState = {
  linodeConfigs: defaultLinodeConfigsState,
  linodeDisks: defaultLinodeDisksState,
  linodes: defaultLinodesState,
};

export interface ResourcesState {
  linodeConfigs: LinodeConfigsState;
  linodeDisks: LinodeDisksState;
  linodes: LinodesState;
}

export interface ApplicationState {
  __resources: ResourcesState;
  authentication: AuthState;
  backups: BackupDrawerState;
  createLinode: LinodeCreateState;
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
  __resources: __resourcesDefaultState,
  authentication: authenticationDefaultState,
  backups: backupsDefaultState,
  createLinode: linodeCreateDefaultState,
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
const __resources = combineReducers({
  linodeConfigs,
  linodeDisks,
  linodes,
});

const reducers = combineReducers<ApplicationState>({
  __resources,
  authentication,
  backups,
  createLinode: linodeCreateReducer,
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

const enhancersFactory = () =>
  compose(
    applyMiddleware(thunk),
    reduxDevTools ? reduxDevTools() : (f: any) => f
  ) as any;

// We need an instance of the query client for some event event handlers
export const storeFactory = () =>
  createStore(reducers, defaultState, enhancersFactory());

export type ApplicationStore = Store<ApplicationState, any>;

export const useApplicationStore = (): ApplicationStore =>
  useStore<ApplicationState>();
