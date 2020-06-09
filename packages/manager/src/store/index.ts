import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import account, {
  defaultState as defaultAccountState,
  State as AccountState
} from 'src/store/account/account.reducer';
import accountSettings, {
  defaultState as defaultAccountSettingsState,
  State as AccountSettingsState
} from 'src/store/accountSettings/accountSettings.reducer';
import { State as AuthState } from 'src/store/authentication';
import authentication, {
  defaultState as authenticationDefaultState
} from 'src/store/authentication/authentication.reducer';
import backups, {
  defaultState as backupsDefaultState,
  State as BackupDrawerState
} from 'src/store/backupDrawer';
import buckets, {
  defaultState as defaultBucketsState,
  State as BucketsState
} from 'src/store/bucket/bucket.reducer';
import bucketDrawer, {
  defaultState as bucketDrawerDefaultState,
  State as BucketDrawerState
} from 'src/store/bucketDrawer/bucketDrawer.reducer';
import clusters, {
  defaultState as defaultClustersState,
  State as ClustersState
} from 'src/store/clusters/clusters.reducer';
import documentation, {
  defaultState as documentationDefaultState,
  State as DocumentationState
} from 'src/store/documentation';
import domainDrawer, {
  defaultState as domainDrawerDefaultState,
  State as DomainDrawerState
} from 'src/store/domainDrawer';
import domainEvents from 'src/store/domains/domains.events';
import domains, {
  defaultState as defaultDomainsState,
  State as DomainsState
} from 'src/store/domains/domains.reducer';
import events, {
  defaultState as eventsDefaultState,
  State as EventsState
} from 'src/store/events/event.reducer';
import firewallDevices, {
  defaultState as defaultFirewallDevicesState,
  State as FirewallDevicesState
} from 'src/store/firewalls/devices.reducer';
import firewalls, {
  defaultState as defaultFirewallState,
  State as FirewallState
} from 'src/store/firewalls/firewalls.reducer';
import globalErrors, {
  defaultState as defaultGlobalErrorState,
  State as GlobalErrorState
} from 'src/store/globalErrors';
import images, {
  defaultState as defaultImagesState,
  State as ImagesState
} from 'src/store/image/image.reducer';
import kubernetes, {
  defaultState as defaultKubernetesState,
  State as KubernetesState
} from 'src/store/kubernetes/kubernetes.reducer';
import nodePools, {
  defaultState as defaultNodePoolsState,
  State as KubeNodePoolsState
} from 'src/store/kubernetes/nodePools.reducer';
import linodeCreateReducer, {
  defaultState as linodeCreateDefaultState,
  State as LinodeCreateState
} from 'src/store/linodeCreate/linodeCreate.reducer';
import linodeConfigEvents from 'src/store/linodes/config/config.events';
import linodeConfigs, {
  defaultState as defaultLinodeConfigsState,
  State as LinodeConfigsState
} from 'src/store/linodes/config/config.reducer';
import linodeDisks, {
  defaultState as defaultLinodeDisksState,
  State as LinodeDisksState
} from 'src/store/linodes/disk/disk.reducer';
import linodeEvents from 'src/store/linodes/linodes.events';
import linodes, {
  defaultState as defaultLinodesState,
  State as LinodesState
} from 'src/store/linodes/linodes.reducer';
import types, {
  defaultState as defaultTypesState,
  State as TypesState
} from 'src/store/linodeType/linodeType.reducer';
import longviewEvents from 'src/store/longview/longview.events';
import longview, {
  defaultState as defaultLongviewState,
  State as LongviewState
} from 'src/store/longview/longview.reducer';
import longviewStats, {
  defaultState as defaultLongviewStatsState,
  State as LongviewStatsState
} from 'src/store/longviewStats/longviewStats.reducer';
import managedIssues, {
  defaultState as defaultManagedIssuesState,
  State as ManagedIssuesState
} from 'src/store/managed/issues.reducer';
import managed, {
  defaultState as defaultManagedState,
  State as ManagedState
} from 'src/store/managed/managed.reducer';
import nodeBalancers, {
  defaultState as defaultNodeBalancerState,
  State as NodeBalancersState
} from 'src/store/nodeBalancer/nodeBalancer.reducer';
import nodeBalancerConfigs, {
  defaultState as defaultNodeBalancerConfigState,
  State as NodeBalancerConfigsState
} from 'src/store/nodeBalancerConfig/nodeBalancerConfig.reducer';
import profile, {
  defaultState as defaultProfileState,
  State as ProfileState
} from 'src/store/profile/profile.reducer';
import regions, {
  defaultState as defaultRegionsState,
  State as RegionsState
} from 'src/store/regions/regions.reducer';
import stackScriptDrawer, {
  defaultState as stackScriptDrawerDefaultState,
  State as StackScriptDrawerState
} from 'src/store/stackScriptDrawer';
import tagImportDrawer, {
  defaultState as tagDrawerDefaultState,
  State as TagImportDrawerState
} from 'src/store/tagImportDrawer';
import volumeEvents from 'src/store/volume/volume.events';
import volumes, {
  defaultState as defaultVolumesState,
  State as VolumesState
} from 'src/store/volume/volume.reducer';
import volumeDrawer, {
  defaultState as volumeDrawerDefaultState,
  State as VolumeDrawerState
} from 'src/store/volumeForm';
import initialLoad, {
  defaultState as initialLoadState,
  State as InitialLoadState
} from './initialLoad/initialLoad.reducer';
import featureFlagsLoad, {
  defaultState as featureFlagsLoadState,
  State as FeatureFlagsLoadState
} from './featureFlagsLoad/featureFlagsLoad.reducer';
import diskEvents from './linodes/disk/disk.events';
import combineEventsMiddleware from './middleware/combineEventsMiddleware';
import imageEvents from './middleware/imageEvents';
import nodeBalancerEvents from './nodeBalancer/nodeBalancer.events';
import nodeBalancerConfigEvents from './nodeBalancerConfig/nodeBalancerConfig.events';
import notifications, {
  defaultState as notificationsDefaultState,
  State as NotificationsState
} from './notification/notification.reducer';
import preferences, {
  defaultState as preferencesState,
  State as PreferencesState
} from './preferences/preferences.reducer';
import { initReselectDevtools } from './selectors';

const reduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__;
initReselectDevtools();

/**
 * Default State
 */
const __resourcesDefaultState = {
  account: defaultAccountState,
  accountSettings: defaultAccountSettingsState,
  domains: defaultDomainsState,
  images: defaultImagesState,
  kubernetes: defaultKubernetesState,
  managed: defaultManagedState,
  managedIssues: defaultManagedIssuesState,
  nodePools: defaultNodePoolsState,
  linodes: defaultLinodesState,
  linodeConfigs: defaultLinodeConfigsState,
  linodeDisks: defaultLinodeDisksState,
  nodeBalancerConfigs: defaultNodeBalancerConfigState,
  nodeBalancers: defaultNodeBalancerState,
  notifications: notificationsDefaultState,
  profile: defaultProfileState,
  regions: defaultRegionsState,
  types: defaultTypesState,
  volumes: defaultVolumesState,
  buckets: defaultBucketsState,
  clusters: defaultClustersState
};

export interface ResourcesState {
  account: AccountState;
  accountSettings: AccountSettingsState;
  domains: DomainsState;
  images: ImagesState;
  kubernetes: KubernetesState;
  managed: ManagedState;
  managedIssues: ManagedIssuesState;
  nodePools: KubeNodePoolsState;
  linodes: LinodesState;
  linodeConfigs: LinodeConfigsState;
  linodeDisks: LinodeDisksState;
  nodeBalancerConfigs: NodeBalancerConfigsState;
  nodeBalancers: NodeBalancersState;
  notifications: NotificationsState;
  profile: ProfileState;
  regions: RegionsState;
  types: TypesState;
  volumes: VolumesState;
  buckets: BucketsState;
  clusters: ClustersState;
}

export interface ApplicationState {
  __resources: ResourcesState;
  authentication: AuthState;
  backups: BackupDrawerState;
  documentation: DocumentationState;
  domainDrawer: DomainDrawerState;
  events: EventsState;
  stackScriptDrawer: StackScriptDrawerState;
  tagImportDrawer: TagImportDrawerState;
  volumeDrawer: VolumeDrawerState;
  bucketDrawer: BucketDrawerState;
  createLinode: LinodeCreateState;
  preferences: PreferencesState;
  initialLoad: InitialLoadState;
  featureFlagsLoad: FeatureFlagsLoadState;
  firewalls: FirewallState;
  firewallDevices: FirewallDevicesState;
  globalErrors: GlobalErrorState;
  longviewClients: LongviewState;
  longviewStats: LongviewStatsState;
}

export const defaultState: ApplicationState = {
  __resources: __resourcesDefaultState,
  authentication: authenticationDefaultState,
  backups: backupsDefaultState,
  documentation: documentationDefaultState,
  domainDrawer: domainDrawerDefaultState,
  events: eventsDefaultState,
  stackScriptDrawer: stackScriptDrawerDefaultState,
  tagImportDrawer: tagDrawerDefaultState,
  volumeDrawer: volumeDrawerDefaultState,
  bucketDrawer: bucketDrawerDefaultState,
  createLinode: linodeCreateDefaultState,
  preferences: preferencesState,
  initialLoad: initialLoadState,
  featureFlagsLoad: featureFlagsLoadState,
  firewalls: defaultFirewallState,
  firewallDevices: defaultFirewallDevicesState,
  globalErrors: defaultGlobalErrorState,
  longviewClients: defaultLongviewState,
  longviewStats: defaultLongviewStatsState
};

/**
 * Reducers
 */
const __resources = combineReducers({
  account,
  accountSettings,
  domains,
  images,
  kubernetes,
  nodePools,
  linodes,
  linodeConfigs,
  linodeDisks,
  managed,
  managedIssues,
  nodeBalancers,
  nodeBalancerConfigs,
  notifications,
  profile,
  regions,
  types,
  volumes,
  buckets,
  clusters
});

const reducers = combineReducers<ApplicationState>({
  __resources,
  authentication,
  backups,
  documentation,
  domainDrawer,
  stackScriptDrawer,
  tagImportDrawer,
  volumeDrawer,
  bucketDrawer,
  events,
  createLinode: linodeCreateReducer,
  preferences,
  initialLoad,
  featureFlagsLoad,
  firewalls,
  firewallDevices,
  globalErrors,
  longviewClients: longview,
  longviewStats
});

const enhancers = compose(
  applyMiddleware(
    thunk,
    combineEventsMiddleware(
      linodeEvents,
      longviewEvents,
      imageEvents,
      domainEvents,
      nodeBalancerEvents,
      nodeBalancerConfigEvents,
      volumeEvents,
      diskEvents,
      linodeConfigEvents
    )
  ),
  reduxDevTools ? reduxDevTools() : (f: any) => f
) as any;

export default createStore(reducers, defaultState, enhancers);
