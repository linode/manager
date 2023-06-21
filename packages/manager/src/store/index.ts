import { useStore } from 'react-redux';
import {
  applyMiddleware,
  combineReducers,
  compose,
  createStore,
  Store,
} from 'redux';
import thunk from 'redux-thunk';
import accountManagement, {
  defaultState as defaultAccountManagementState,
  State as AccountManagementState,
} from 'src/store/accountManagement/accountManagement.reducer';
import { State as AuthState } from 'src/store/authentication';
import authentication, {
  defaultState as authenticationDefaultState,
} from 'src/store/authentication/authentication.reducer';
import backups, {
  defaultState as backupsDefaultState,
  State as BackupDrawerState,
} from 'src/store/backupDrawer';
import events, {
  defaultState as eventsDefaultState,
  State as EventsState,
} from 'src/store/events/event.reducer';
import globalErrors, {
  defaultState as defaultGlobalErrorState,
  State as GlobalErrorState,
} from 'src/store/globalErrors';
import linodeCreateReducer, {
  defaultState as linodeCreateDefaultState,
  State as LinodeCreateState,
} from 'src/store/linodeCreate/linodeCreate.reducer';
import linodeConfigs, {
  defaultState as defaultLinodeConfigsState,
  State as LinodeConfigsState,
} from 'src/store/linodes/config/config.reducer';
import linodeDisks, {
  defaultState as defaultLinodeDisksState,
  State as LinodeDisksState,
} from 'src/store/linodes/disk/disk.reducer';
import linodes, {
  defaultState as defaultLinodesState,
  State as LinodesState,
} from 'src/store/linodes/linodes.reducer';
import longview, {
  defaultState as defaultLongviewState,
  State as LongviewState,
} from 'src/store/longview/longview.reducer';
import longviewStats, {
  defaultState as defaultLongviewStatsState,
  State as LongviewStatsState,
} from 'src/store/longviewStats/longviewStats.reducer';
import stackScriptDialog, {
  defaultState as stackScriptDialogDefaultState,
  State as StackScriptDialogState,
} from 'src/store/stackScriptDialog';
import volumeDrawer, {
  defaultState as volumeDrawerDefaultState,
  State as VolumeDrawerState,
} from 'src/store/volumeForm';
import featureFlagsLoad, {
  defaultState as featureFlagsLoadState,
  State as FeatureFlagsLoadState,
} from './featureFlagsLoad/featureFlagsLoad.reducer';
import initialLoad, {
  defaultState as initialLoadState,
  State as InitialLoadState,
} from './initialLoad/initialLoad.reducer';
import mockFeatureFlags, {
  defaultMockFeatureFlagState,
  MockFeatureFlagState,
} from './mockFeatureFlags';
import pendingUpload, {
  defaultState as pendingUploadState,
  State as PendingUploadState,
} from './pendingUpload';
import { initReselectDevtools } from './selectors';

const reduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__;
initReselectDevtools();

/**
 * Default State
 */
const __resourcesDefaultState = {
  accountManagement: defaultAccountManagementState,
  linodes: defaultLinodesState,
  linodeConfigs: defaultLinodeConfigsState,
  linodeDisks: defaultLinodeDisksState,
};

export interface ResourcesState {
  accountManagement: AccountManagementState;
  linodes: LinodesState;
  linodeConfigs: LinodeConfigsState;
  linodeDisks: LinodeDisksState;
}

export interface ApplicationState {
  __resources: ResourcesState;
  authentication: AuthState;
  backups: BackupDrawerState;
  events: EventsState;
  stackScriptDialog: StackScriptDialogState;
  volumeDrawer: VolumeDrawerState;
  createLinode: LinodeCreateState;
  pendingUpload: PendingUploadState;
  initialLoad: InitialLoadState;
  featureFlagsLoad: FeatureFlagsLoadState;
  globalErrors: GlobalErrorState;
  longviewClients: LongviewState;
  longviewStats: LongviewStatsState;
  mockFeatureFlags: MockFeatureFlagState;
}

export const defaultState: ApplicationState = {
  __resources: __resourcesDefaultState,
  authentication: authenticationDefaultState,
  backups: backupsDefaultState,
  events: eventsDefaultState,
  stackScriptDialog: stackScriptDialogDefaultState,
  volumeDrawer: volumeDrawerDefaultState,
  createLinode: linodeCreateDefaultState,
  pendingUpload: pendingUploadState,
  initialLoad: initialLoadState,
  featureFlagsLoad: featureFlagsLoadState,
  globalErrors: defaultGlobalErrorState,
  longviewClients: defaultLongviewState,
  longviewStats: defaultLongviewStatsState,
  mockFeatureFlags: defaultMockFeatureFlagState,
};

/**
 * Reducers
 */
const __resources = combineReducers({
  accountManagement,
  linodes,
  linodeConfigs,
  linodeDisks,
});

const reducers = combineReducers<ApplicationState>({
  __resources,
  authentication,
  backups,
  stackScriptDialog,
  volumeDrawer,
  events,
  createLinode: linodeCreateReducer,
  pendingUpload,
  initialLoad,
  featureFlagsLoad,
  globalErrors,
  longviewClients: longview,
  longviewStats,
  mockFeatureFlags,
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
