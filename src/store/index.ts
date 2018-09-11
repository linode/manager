import { applyMiddleware, combineReducers, compose, createStore } from 'redux';

import thunk from 'redux-thunk';
import authentication, { defaultState as defaultAuthenticationState } from './reducers/authentication';
import documentation, { defaultState as defaultDocumentationState } from './reducers/documentation';
import features, { defaultState as defaultFeaturesState } from './reducers/features';
import resources, { defaultState as defaultResourcesState } from './reducers/resources';
import volumeDrawer, { defaultState as defaultVolumeDrawerState } from './reducers/volumeDrawer';

const defaultState: ApplicationState = {
  __resources: defaultResourcesState,
  authentication: defaultAuthenticationState,
  documentation: defaultDocumentationState,
  features: defaultFeaturesState,
  volumeDrawer: defaultVolumeDrawerState,
};

const reduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__;

const reducers = combineReducers<ApplicationState>({
  __resources: resources,
  authentication,
  documentation,
  features,
  volumeDrawer,
});

const enhancers = compose(
  applyMiddleware(thunk),
  reduxDevTools ? reduxDevTools() : (f: any) => f,
) as any;

export default createStore<ApplicationState>(reducers, defaultState, enhancers);
