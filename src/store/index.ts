import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import authentication from './reducers/authentication';
import backups from './reducers/backupDrawer';
import documentation from './reducers/documentation';
import domainDrawer from './reducers/domainDrawer';
import events from './reducers/events';
import features from './reducers/features';
import notifications from './reducers/notifications';
import __resources from './reducers/resources';
import sidebar from './reducers/sidebar';
import volumeDrawer from './reducers/volumeDrawer';

const reduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__;

const reducers = combineReducers<ApplicationState>({
  __resources,
  authentication,
  backups,
  documentation,
  features,
  sidebar,
  volumeDrawer,
  notifications,
  domainDrawer,
  events,
});

const enhancers = compose(
  applyMiddleware(thunk),
  reduxDevTools ? reduxDevTools() : (f: any) => f,
) as any;

export default createStore(reducers, undefined, enhancers);
