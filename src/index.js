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

const store = configureStore();
const history = createHistory();
syncReduxAndRouter(history, store);

import Layout from './containers/Layout';
import IndexPage from './containers/IndexPage';
import OAuthCallbackPage from './containers/OAuth';
import NotFound from './containers/NotFound';

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
