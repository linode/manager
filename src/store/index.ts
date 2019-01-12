import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import account, { DEFAULT_STATE as defaultAccountState } from 'src/store/account';
import accountSettings, { DEFAULT_STATE as defaultAccountSettingsState } from 'src/store/accountSettings';
import authentication, { defaultState as authenticationDefaultState } from 'src/store/authentication';
import backups, { defaultState as backupsDefaultState } from 'src/store/backupDrawer';
import documentation, { defaultState as documentationDefaultState } from 'src/store/documentation';
import domainDrawer, { defaultState as domainDrawerDefaultState } from 'src/store/domainDrawer';
import domainEvents from 'src/store/domains/domains.events';
import domains, { defaultState as defaultDomainsState } from 'src/store/domains/domains.reducer';
import images, { defaultState as defaultImagesState } from 'src/store/images';
import linodeDetail, { defaultState as linodeDetailDefaultState } from 'src/store/linodeDetail';
import linodeEvents from 'src/store/linodes/linodes.events';
import linodes, { defaultState as defaultLinodesState } from 'src/store/linodes/linodes.reducer';
import types, { defaultState as defaultTypesState } from 'src/store/linodeTypes';
import profile, { DEFAULT_STATE as defaultProfileState } from 'src/store/profile';
import regions, { defaultState as defaultRegionsState } from 'src/store/regions/regions.reducer';
import stackScriptDrawer, { defaultState as stackScriptDrawerDefaultState } from 'src/store/stackScriptDrawer';
import tagImportDrawer, { defaultState as tagDrawerDefaultState } from 'src/store/tagImportDrawer';
import volumeDrawer, { defaultState as volumeDrawerDefaultState } from 'src/store/volumeDrawer';
import events, { defaultState as eventsDefaultState } from './events';
import combineEventsMiddleware from './middleware/combineEventsMiddleware';
import imageEvents from './middleware/imageEvents';
import notifications, { DEFAULT_STATE as notificationsDefaultState } from './notifications';

const reduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__;

/**
 * Default State
 */
const __resourcesDefaultState = {
  account: defaultAccountState,
  accountSettings: defaultAccountSettingsState,
  domains: defaultDomainsState,
  images: defaultImagesState,
  linodes: defaultLinodesState,
  notifications: notificationsDefaultState,
  profile: defaultProfileState,
  regions: defaultRegionsState,
  types: defaultTypesState,
};

const featuresDefaultState = {
  linodeDetail: linodeDetailDefaultState,
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
  volumeDrawer: volumeDrawerDefaultState,
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
  notifications,
  profile,
  regions,
  types,
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
  events,
});


const enhancers = compose(
  applyMiddleware(
    thunk,
    combineEventsMiddleware(
      linodeEvents,
      imageEvents,
      domainEvents,
    ),
  ),
  reduxDevTools ? reduxDevTools() : (f: any) => f,
) as any;

export default createStore(reducers, defaultState, enhancers);
