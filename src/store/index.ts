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
import authentication, {
  defaultState as authenticationDefaultState,
  State as AuthState
} from 'src/store/authentication';
import backups, {
  defaultState as backupsDefaultState,
  State as BackupDrawerState
} from 'src/store/backupDrawer';
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
import images, {
  defaultState as defaultImagesState,
  State as ImagesStata
} from 'src/store/image/image.reducer';
import linodeDetail, {
  defaultState as linodeDetailDefaultState,
  State as LinodeDetailState
} from 'src/store/linodeDetail';
import linodeEvents from 'src/store/linodes/linodes.events';
import linodes, {
  defaultState as defaultLinodesState,
  State as LinodesState
} from 'src/store/linodes/linodes.reducer';
import types, {
  defaultState as defaultTypesState,
  State as TypesState
} from 'src/store/linodeType/linodeType.reducer';
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
} from 'src/store/volumeDrawer';
import combineEventsMiddleware from './middleware/combineEventsMiddleware';
import imageEvents from './middleware/imageEvents';
import nodeBalancerEvents from './nodeBalancer/nodeBalancer.events';
import nodeBalancerConfigEvents from './nodeBalancerConfig/nodeBalancerConfig.events';
import notifications, {
  defaultState as notificationsDefaultState,
  State as NotificationsState
} from './notification/notification.reducer';

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
  linodes: defaultLinodesState,
  nodeBalancerConfigs: defaultNodeBalancerConfigState,
  nodeBalancers: defaultNodeBalancerState,
  notifications: notificationsDefaultState,
  profile: defaultProfileState,
  regions: defaultRegionsState,
  types: defaultTypesState,
  volumes: defaultVolumesState
};

const featuresDefaultState = {
  linodeDetail: linodeDetailDefaultState
};

export interface FeaturesState {
  linodeDetail: LinodeDetailState;
}

export interface ResourcesState {
  account: AccountState;
  accountSettings: AccountSettingsState;
  domains: DomainsState;
  images: ImagesStata;
  linodes: LinodesState;
  nodeBalancerConfigs: NodeBalancerConfigsState;
  nodeBalancers: NodeBalancersState;
  notifications: NotificationsState;
  profile: ProfileState;
  regions: RegionsState;
  types: TypesState;
  volumes: VolumesState;
}

export interface ApplicationState {
  __resources: ResourcesState;
  authentication: AuthState;
  backups: BackupDrawerState;
  documentation: DocumentationState;
  domainDrawer: DomainDrawerState;
  events: EventsState;
  features: FeaturesState;
  stackScriptDrawer: StackScriptDrawerState;
  tagImportDrawer: TagImportDrawerState;
  volumeDrawer: VolumeDrawerState;
}

const defaultState: ApplicationState = {
  __resources: __resourcesDefaultState,
  authentication: authenticationDefaultState,
  backups: backupsDefaultState,
  documentation: documentationDefaultState,
  domainDrawer: domainDrawerDefaultState,
  events: eventsDefaultState,
  features: featuresDefaultState,
  stackScriptDrawer: stackScriptDrawerDefaultState,
  tagImportDrawer: tagDrawerDefaultState,
  volumeDrawer: volumeDrawerDefaultState
};

/**
 * Reducers
 */
const __resources = combineReducers({
  account,
  accountSettings,
  domains,
  images,
  linodes,
  nodeBalancers,
  nodeBalancerConfigs,
  notifications,
  profile,
  regions,
  types,
  volumes
});

const features = combineReducers({ linodeDetail });

const reducers = combineReducers<ApplicationState>({
  __resources,
  authentication,
  backups,
  documentation,
  domainDrawer,
  features,
  stackScriptDrawer,
  tagImportDrawer,
  volumeDrawer,
  events
});

const enhancers = compose(
  applyMiddleware(
    thunk,
    combineEventsMiddleware(
      linodeEvents,
      imageEvents,
      domainEvents,
      nodeBalancerEvents,
      nodeBalancerConfigEvents,
      volumeEvents
    )
  ),
  reduxDevTools ? reduxDevTools() : (f: any) => f
) as any;

export default createStore(reducers, defaultState, enhancers);
