import { combineReducers, createStore } from 'redux';

import authentication, { defaultState as authenticationState } from './reducers/authentication';
import documentation, { defaultState as documentationState } from './reducers/documentation';
import events, {defaultState as eventState} from './reducers/events';
import resources, { defaultState as resourcesState } from './reducers/resources';
import volumeDrawer, { defaultState as volumeDrawerState } from './reducers/volumeDrawer';

const defaultState: Linode.AppState = {
  authentication: authenticationState,
  resources: resourcesState,
  documentation: documentationState,
  events: eventState,
  volumeDrawer: volumeDrawerState,
};

export default createStore<Linode.AppState>(
  combineReducers({
    authentication,
    documentation,
    events,
    resources,
    volumeDrawer,
  }),
  defaultState,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
);
