import { combineReducers, createStore } from 'redux';

import authentication, { defaultState as authenticationState } from './reducers/authentication';
import documentation, { defaultState as documentationState } from './reducers/documentation';
import resources, { defaultState as resourcesState } from './reducers/resources';
import volumeDrawer, { defaultState as volumeDrawerState } from './reducers/volumeDrawer';

const defaultState: Linode.AppState = {
  authentication: authenticationState,
  resources: resourcesState,
  documentation: documentationState,
  volumeDrawer: volumeDrawerState,
};

export default createStore<Linode.AppState>(
  combineReducers({
    authentication,
    documentation,
    resources,
    volumeDrawer,
  }),
  defaultState,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
);
