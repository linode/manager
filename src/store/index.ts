import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import combineEventsMiddleware from './middleware/combineEventsMiddleware';
import imageEvents from './middleware/imageEvents';
import linodeEvents from './middleware/linodeEvents';
import authentication, { defaultState as authenticationDefaultState } from './reducers/authentication';
import backups, { defaultState as backupsDefaultState } from './reducers/backupDrawer';
import documentation, { defaultState as documentationDefaultState } from './reducers/documentation';
import domainDrawer, { defaultState as domainDrawerDefaultState } from './reducers/domainDrawer';
import events, { defaultState as eventsDefaultState } from './reducers/events';
import features, { defaultState as featuresDefaultState } from './reducers/features';
import notifications, { DEFAULT_STATE as notificationsDefaultState } from './reducers/notifications';
import __resources, { defaultState as resourcesDefaultState } from './reducers/resources';
import stackScriptDrawer, { defaultState as stackScriptDrawerDefaultState } from './reducers/stackScriptDrawer';
import tagImportDrawer, { defaultState as tagDrawerDefaultState } from './reducers/tagImportDrawer';
import volumeDrawer, { defaultState as volumeDrawerDefaultState } from './reducers/volumeDrawer';
import { events as volumeEvents } from './volumes';


const reduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__;

const reducers = combineReducers<ApplicationState>({
  __resources,
  authentication,
  backups,
  documentation,
  domainDrawer,
  events,
  features,
  notifications,
  stackScriptDrawer,
  tagImportDrawer,
  volumeDrawer,
});

const defaultState: ApplicationState = {
  __resources: resourcesDefaultState,
  authentication: authenticationDefaultState,
  backups: backupsDefaultState,
  documentation: documentationDefaultState,
  domainDrawer: domainDrawerDefaultState,
  events: eventsDefaultState,
  features: featuresDefaultState,
  notifications: notificationsDefaultState,
  stackScriptDrawer: stackScriptDrawerDefaultState,
  tagImportDrawer: tagDrawerDefaultState,
  volumeDrawer: volumeDrawerDefaultState,
};

const enhancers = compose(
  applyMiddleware(
    thunk,
    combineEventsMiddleware(
      linodeEvents,
      imageEvents,
      volumeEvents,
    ),
  ),
  reduxDevTools ? reduxDevTools() : (f: any) => f,
) as any;

export default createStore(reducers, defaultState, enhancers);
