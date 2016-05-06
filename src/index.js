import 'babel-polyfill';
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
import { APP_ROOT, LOGIN_ROOT } from './constants';

const store = configureStore();
const history = createHistory();
syncReduxAndRouter(history, store);

import Layout from './layouts/Layout';
import OAuthCallbackPage from './layouts/OAuth';
import NotFound from './layouts/NotFound';
import IndexPage from './layouts/IndexPage';
import LinodeDetailPage from './layouts/LinodeDetailPage';
import CreateLinodePage from './layouts/CreateLinodePage';

const init = () => {
  let state = store.getState();
  // TODO: Persist your session in a cookie or localStorage or something?
  function checkLogin(next, replace) {
    if (next.location.pathname !== '/oauth/callback' && state.authentication.token === null) {
      const query = Object.keys(next.location.query)
              .reduce((a,k) => [...a, `${k}=${encodeURIComponent(next.location.query[k])}`], []).join('%26');
      window.location = `${LOGIN_ROOT}/oauth/authorize?`+
        `client_id=${client_id}` +
        `&scopes=*` +
        `&redirect_uri=${encodeURIComponent(APP_ROOT)}/oauth/callback?return=` +
              encodeURIComponent(next.location.pathname + (query ? '%3F' + query : ''));
      return;
    }
  }

  render(
    <Provider store={store}>
      <div>
        <Router history={history}>
          <Route onEnter={checkLogin} path="/" component={Layout}>
            <IndexRoute component={IndexPage} />
            <Route path="linodes/create" component={CreateLinodePage} />
            <Route path="linodes/:linodeId" component={LinodeDetailPage} />
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

init();
