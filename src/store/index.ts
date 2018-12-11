import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import eventsMiddleware from './middleware/events';
import authentication, { defaultState as authenticationDefaultState } from './reducers/authentication';
import backups, { defaultState as backupsDefaultState } from './reducers/backupDrawer';
import documentation, { defaultState as documentationDefaultState } from './reducers/documentation';
import domainDrawer, { defaultState as domainDrawerDefaultState } from './reducers/domainDrawer';
import events, { defaultState as eventsDefaultState } from './reducers/events';
import features, { defaultState as featuresDefaultState } from './reducers/features';
import notifications, { DEFAULT_STATE as notificationsDefaultState } from './reducers/notifications';
import __resources, { defaultState as resourcesDefaultState } from './reducers/resources';
import tagImportDrawer from './reducers/tagImportDrawer';
import volumeDrawer, { defaultState as volumeDrawerDefaultState } from './reducers/volumeDrawer';

const reduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__;

const reducers = combineReducers<ApplicationState>({
  __resources,
  authentication,
  backups,
  documentation,
  features,
  volumeDrawer,
  notifications,
  domainDrawer,
  events,
  tagImportDrawer,
});

const defaultState: ApplicationState = {
  __resources: resourcesDefaultState,
  authentication: authenticationDefaultState,
  backups: backupsDefaultState,
  documentation: documentationDefaultState,
  features: featuresDefaultState,
  volumeDrawer: volumeDrawerDefaultState,
  notifications: notificationsDefaultState,
  domainDrawer: domainDrawerDefaultState,
  events: eventsDefaultState,
};

const enhancers = compose(
  applyMiddleware(thunk, eventsMiddleware),
  reduxDevTools ? reduxDevTools() : (f: any) => f,
) as any;

export default createStore(reducers, defaultState, enhancers);
