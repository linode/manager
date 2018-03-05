import { createStore, combineReducers } from 'redux';
import resources, { defaultState as resourcesState } from './reducers/resources';
import authentication, { defaultState as authenticationState } from './reducers/authentication';

const defaultState: Linode.AppState = {
  authentication: authenticationState,
  resources: resourcesState,
};

export default createStore<Linode.AppState>(
  combineReducers({
    authentication,
    resources,
  }),
  defaultState,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
);
