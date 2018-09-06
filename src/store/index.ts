import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';

import authentication, { defaultState as authenticationState } from './reducers/authentication';
import documentation, { defaultState as documentationState } from './reducers/documentation';
import resources, { defaultState as resourcesState } from './reducers/resources';
import volumeDrawer, { defaultState as volumeDrawerState } from './reducers/volumeDrawer';


const reduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__;

const defaultState: ApplicationState = {
  authentication: authenticationState,
  resources: resourcesState,
  documentation: documentationState,
  volumeDrawer: volumeDrawerState,
};

const reducers = combineReducers<ApplicationState>({
  authentication,
  documentation,
  resources,
  volumeDrawer,
});

const enhancers = compose(
  applyMiddleware(thunk),
  reduxDevTools ? reduxDevTools() : (f: any) => f,
) as any;

export default createStore<ApplicationState>(reducers, defaultState, enhancers);
