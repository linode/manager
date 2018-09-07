import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import authentication, { defaultState as authenticationState } from './reducers/authentication';
import documentation, { defaultState as documentationState } from './reducers/documentation';
import profile, { DEFAULT_STATE as profileState } from './reducers/resources/profile';
import volumeDrawer, { defaultState as volumeDrawerState } from './reducers/volumeDrawer';

const reduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__;

const defaultState: ApplicationState = {
  __resources: {
    profile: profileState,
  },
  authentication: authenticationState,
  documentation: documentationState,
  volumeDrawer: volumeDrawerState,
};

const reducers = combineReducers<ApplicationState>({
  __resources: combineReducers({
    profile,
  }),
  authentication,
  documentation,
  volumeDrawer,
});

const enhancers = compose(
  applyMiddleware(thunk),
  reduxDevTools ? reduxDevTools() : (f: any) => f,
) as any;

export default createStore<ApplicationState>(reducers, defaultState, enhancers);
