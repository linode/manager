import { createStore, combineReducers } from 'redux';
import resources, { defaultState as resourcesState } from './reducers/resources';
import authentication, { defaultState as authenticationState } from './reducers/authentication';
import documentation, { defaultState as documentationState } from './reducers/documentation';

const defaultState: Linode.AppState = {
  authentication: authenticationState,
  resources: resourcesState,
  documentation: documentationState,
};

export default createStore<Linode.AppState>(
  combineReducers({
    authentication,
    documentation,
    resources,
  }),
  defaultState,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
);
