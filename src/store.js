import { createStore, compose, applyMiddleware } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunk from 'redux-thunk';
import reducers from './reducers';
import createHistory from 'history/createBrowserHistory';

export const history = createHistory();

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

function initStore(history) {
  return createStore(
    reducers,
    composeEnhancers(
      applyMiddleware(...[
        /**
         * List middleware here in order of expected execution from top down.
         */
        routerMiddleware(history),
        thunk,
      ]),
    ),
  );
}

export const store = initStore(history);
