import { createStore, compose, applyMiddleware } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunk from 'redux-thunk';
import authenticationMiddleware from '~/middleware/authentication';
import modalCloser from '~/middleware/modalCloser';
import reducers from './reducers';
import createHistory from 'history/createBrowserHistory';
import { ENVIRONMENT } from '~/constants';
export const history = createHistory();

const composeEnhancers = (ENVIRONMENT === 'development')
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  : compose;

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
        authenticationMiddleware,
        modalCloser,
      ]),
    ),
  );
}

export const store = initStore(history);
