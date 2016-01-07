import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import reducer from '../reducers';
import DevTools from '../containers/DevTools';

const createStoreWithMiddleware = compose(
  applyMiddleware(
    thunk
  ),
  DevTools.instrument()
)(createStore)

export default function configureStore(initialState) {
  const store = createStoreWithMiddleware(reducer, initialState);

  if (module.hot) {
    module.hot.accept('../reducers', () => 
      store.replaceReducer(require('../reducers').default)
    );
  }

  return store;
}
