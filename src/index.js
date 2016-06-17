import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import { Router, Route, IndexRedirect, browserHistory } from 'react-router';
import DevTools from './components/DevTools';
import { syncHistoryWithStore } from 'react-router-redux';
// eslint-disable-next-line no-unused-vars
import styles from '../scss/manager.scss';
import { clientId } from './secrets';
import { APP_ROOT, LOGIN_ROOT } from './constants';

const store = configureStore();
const history = syncHistoryWithStore(browserHistory, store);

import Layout from './layouts/Layout';
import OAuthCallbackPage from './layouts/OAuth';
import NotFound from './layouts/NotFound';
import Linodes from './linodes';

const init = () => {
  const state = store.getState();
  function checkLogin(next) {
    if (next.location.pathname !== '/oauth/callback' && state.authentication.token === null) {
      const query = Object.keys(next.location.query)
              .reduce((a, k) => [
                ...a,
                `${k}=${encodeURIComponent(next.location.query[k])}`,
              ], []).join('%26');
      /* eslint-disable prefer-template */
      window.location = `${LOGIN_ROOT}/oauth/authorize?` +
        `client_id=${clientId}` +
        '&scopes=*' +
        `&redirect_uri=${encodeURIComponent(APP_ROOT)}/oauth/callback?return=` +
              encodeURIComponent(next.location.pathname + (query ? '%3F' + query : ''));
      /* eslint-enable prefer-template */
      return;
    }
  }

  render(
    <Provider store={store}>
      <div>
        <Router history={history}>
          <Route onEnter={checkLogin} path="/" component={Layout}>
            <IndexRedirect to="/linodes" />
            {Linodes}
            <Route path="oauth">
              <Route path="callback" component={OAuthCallbackPage} />
            </Route>
            <Route path="*" component={NotFound} />
          </Route>
        </Router>
        <DevTools />
      </div>
    </Provider>,
    document.getElementById('root')
  );
};

window.init = init;
