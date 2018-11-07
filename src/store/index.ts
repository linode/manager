import { applyMiddleware, combineReducers, compose, createStore } from 'redux';

import thunk from 'redux-thunk';
import authentication, { defaultState as defaultAuthenticationState } from './reducers/authentication';
import backups, { defaultState as defaultBackupState } from './reducers/backupDrawer';
import documentation, { defaultState as defaultDocumentationState } from './reducers/documentation';
import features, { defaultState as defaultFeaturesState } from './reducers/features';
import notifications, { DEFAULT_STATE as defaultNotificationState } from './reducers/notifications';
import resources, { defaultState as defaultResourcesState } from './reducers/resources';
import sidebar, { defaultState as defaultSidebarState } from './reducers/sidebar';
import volumeDrawer, { defaultState as defaultVolumeDrawerState } from './reducers/volumeDrawer';

const defaultState: ApplicationState = {
  __resources: defaultResourcesState,
  authentication: defaultAuthenticationState,
  backups: defaultBackupState,
  documentation: defaultDocumentationState,
  features: defaultFeaturesState,
  sidebar: defaultSidebarState,
  volumeDrawer: defaultVolumeDrawerState,
  notifications: defaultNotificationState,
};

const reduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__;

const reducers = combineReducers<ApplicationState>({
  __resources: resources,
  authentication,
  backups,
  documentation,
  features,
  sidebar,
  volumeDrawer,
  notifications,
});

const enhancers = compose(
  applyMiddleware(thunk),
  reduxDevTools ? reduxDevTools() : (f: any) => f,
) as any;

export default createStore<ApplicationState>(reducers, defaultState, enhancers);
