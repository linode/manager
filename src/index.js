import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import { Router, Route, IndexRedirect, browserHistory } from 'react-router';
import DevTools from './components/DevTools';
import { syncHistoryWithStore } from 'react-router-redux';

import checkLogin from './session';

// eslint-disable-next-line no-unused-vars
import styles from '../scss/manager.scss';

const history = syncHistoryWithStore(browserHistory, store);

import Layout from './layouts/Layout';
import OAuthCallbackPage from './layouts/OAuth';
import NotFound from './layouts/NotFound';
import Linodes from './linodes';

const init = () => {
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
