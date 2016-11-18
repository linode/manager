import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import { Router, Route, RouterContext, IndexRedirect, browserHistory } from 'react-router';
import DevTools from './components/DevTools';
import { syncHistoryWithStore } from 'react-router-redux';
import { match } from 'react-router';
import ReactGA from 'react-ga';
import { GA_ID } from './constants';

import checkLogin, { initializeAuthentication } from './session';

// eslint-disable-next-line no-unused-vars
import styles from '../scss/manager.scss';

const history = syncHistoryWithStore(browserHistory, store);
initializeAuthentication(store.dispatch);

import Layout from './layouts/Layout';
import OAuthCallbackPage from './layouts/OAuth';
import Logout from './layouts/Logout';
import { NotFound } from './components/Error';
import Linodes from './linodes';
import Weblish from './linodes/linode/layouts/Weblish';
import NodeBalancers from './nodebalancers';
import Longview from './longview';
import DNSManager from './dnsmanager';
import Support from './support';
import { hideModal } from '~/actions/modal';

import { actions, thunks, reducer } from '~/api/configs/linodes';
window.actions = actions; window.thunks = thunks; window.reducer = reducer;

ReactGA.initialize(GA_ID); // eslint-disable-line no-undef
function logPageView() {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
}

class LoadingRouterContext extends RouterContext {
  constructor() {
    super();
    this.fetching = false;
  }

  componentWillReceiveProps(newProps) {
    if (super.componentWillReceiveProps) {
      super.componentWillReceiveProps(newProps);
    }

    // Suppress component update until after route preloads have finished
    this.fetching = true;

    match({
      routes: newProps.routes,
      location: newProps.location.pathname,
    }, async (error, redirectLocation, redirectParams) => {
      // Call any route preload functions
      for (let i = 0; i < redirectParams.routes.length; i++) {
        if (redirectParams.routes[i].hasOwnProperty('preload')) {
          await redirectParams.routes[i].preload(store.dispatch,
                                                 newProps.params);
        }
      }

      // Allow component update now that preloads are done
      this.fetching = false;

      // Set anything at all to force an update
      this.setState({
        updateNow: 'please',
      });
    });
  }

  shouldComponentUpdate(newProps, newState) {
    return !this.fetching;
  }
}

const init = () => {
  render(
    <Provider store={store}>
      <div>
        <Router history={history} onUpdate={logPageView}
          render={props => <LoadingRouterContext {...props} />}>
          <Route
            path="/logout"
            component={Logout}
          />
          <Route
            onEnter={checkLogin}
            path="/linodes/:linodeId/weblish"
            component={Weblish}
          />
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
