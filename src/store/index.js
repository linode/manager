import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { routerMiddleware } from 'react-router-redux';
import { browserHistory } from 'react-router';

import reducer from '../reducers';
import DevTools from '../components/DevTools';

const composedEnhancers = compose(
  applyMiddleware(thunk, routerMiddleware(browserHistory)),
  DevTools.instrument()
);

export function configureStore(initialState) {
  const store = createStore(reducer, initialState, composedEnhancers);

  if (module.hot) {
    module.hot.accept('../reducers', () =>
      // eslint-disable-next-line global-require
      store.replaceReducer(require('../reducers')['default'])
    );
  }

  return store;
}

const store = configureStore();

export default store;
