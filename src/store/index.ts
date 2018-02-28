import { createStore } from 'redux';
import reducers from './reducers';

const defaultState: Linode.AppState = {
  authentication: {
    token: null,
    scopes: null,
  },
  api: {},
};

export default createStore<Linode.AppState>(
  reducers,
  defaultState,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
);
