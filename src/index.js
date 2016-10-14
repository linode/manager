import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, IndexRedirect, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import { hideModal } from '~/actions/modal';
import { actions, thunks, reducer } from '~/api/configs/linodes';
import store from './store';
import DevTools from './components/DevTools';
import checkLogin, { initializeAuthentication } from './session';
// eslint-disable-next-line no-unused-vars
import styles from '../scss/manager.scss';
import Layout from './layouts/Layout';
import OAuthCallbackPage from './layouts/OAuth';
import { NotFound } from './components/Error';
import Linodes from './linodes';
import NodeBalancers from './nodebalancers';
import Longview from './longview';
import DNSManager from './dnsmanager';
import Account from './account';
import Support from './support';

const history = syncHistoryWithStore(browserHistory, store);
initializeAuthentication(store.dispatch);

window.actions = actions; window.thunks = thunks; window.reducer = reducer;

const init = () => {
  render(
    <Provider store={store}>
      <div>
        <Router history={history}>
          <Route
            onEnter={checkLogin}
            onChange={() => store.dispatch(hideModal())}
            path="/"
            component={Layout}
          >
            <IndexRedirect to="/linodes" />
            {Linodes}
            {NodeBalancers}
            {Longview}
            {DNSManager}
            {Account}
            {Support}
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
