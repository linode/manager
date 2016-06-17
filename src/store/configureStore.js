import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import reducer from '../reducers';
import DevTools from '../components/DevTools';
import { routerMiddleware } from 'react-router-redux';
import { browserHistory } from 'react-router';

const createStoreWithMiddleware = compose(
  applyMiddleware(thunk),
  applyMiddleware(routerMiddleware(browserHistory)),
  DevTools.instrument()
)(createStore);

export default function configureStore(initialState) {
  const store = createStoreWithMiddleware(reducer, initialState);

  if (module.hot) {
    module.hot.accept('../reducers', () =>
      // eslint-disable-next-line global-require
      store.replaceReducer(require('../reducers')['default'])
    );
  }

  return store;
}
