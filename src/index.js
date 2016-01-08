import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import { createHistory } from 'history';
import { Router, Route, IndexRoute } from 'react-router';
import DevTools from './containers/DevTools';
import { syncReduxAndRouter } from 'redux-simple-router'
import styles from '../scss/manager.scss';
import { client_id } from './secrets';

const store = configureStore();
const history = createHistory();
syncReduxAndRouter(history, store);

import Layout from './containers/Layout';
import IndexPage from './containers/IndexPage';
import CounterPage from './containers/CounterPage';
import NotFound from './containers/NotFound';
import * as oauth from './containers/oauth';

const init = () => {
  let state = store.getState();
  // TODO: Persist your session in a cookie or localStorage or something
  if (window.location.pathname !== "/oauth/callback") {
    window.location = `https://login.alpha.linode.com/oauth/authorize?client_id=${client_id}&scopes=*`;
    return;
  }

  render(
    <Provider store={store}>
      <div>
        <Router history={history}>
          <Route path="/" component={Layout}>
            <IndexRoute component={IndexPage} />
            <Route path="counter" component={CounterPage} />
          </Route>
          <Route path="/oauth">
            <Route path="callback" onEnter={(n, r) => oauth.default(store, n, r)} />
          </Route>
          <Route path="*" component={NotFound} />
        </Router>
        <DevTools />
      </div>
    </Provider>,
    document.getElementById('root')
  );
};

init();
