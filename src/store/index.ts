import { createStore } from 'redux';
import reducers from './reducers';

import { defaultState as apiDefaultState } from './reducers/api';

const defaultState: Linode.AppState = {
  authentication: {
    token: null,
    scopes: null,
  },
  api: apiDefaultState,
};

export default createStore<Linode.AppState>(
  reducers,
  defaultState,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
);
