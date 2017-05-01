import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, IndexRedirect, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import ReactGA from 'react-ga';

import { store } from './store';
import DevTools from './components/DevTools';
import { GA_ID } from './constants';
import { initializeAuthentication } from './session';

// eslint-disable-next-line no-unused-vars
import styles from '../scss/manager.scss';

const history = syncHistoryWithStore(browserHistory, store);
initializeAuthentication(store.dispatch);

import Layout from './layouts/Layout';
import OAuthCallbackPage from './layouts/OAuth';
import Logout from './layouts/Logout';
import { NotFound } from 'linode-components/errors';
import Linodes from './linodes';
import Weblish from './linodes/linode/layouts/Weblish';
import NodeBalancers from './nodebalancers';
import Domains from './domains';
import Profile from './profile';
import Users from './users';
import Billing from './billing';
import Settings from './settings';
import Support from './support';
import Styleguide from 'linode-styleguide';
import { hideModal } from '~/actions/modal';
import { LoadingRouterContext } from '~/router';

import { actions, thunks, reducer } from '~/api/configs/linodes';
window.actions = actions; window.thunks = thunks; window.reducer = reducer;

ReactGA.initialize(GA_ID); // eslint-disable-line no-undef
function logPageView() {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
}

function fillInMissingProps(props) {
  // This randomly started not being passed in but is required by RouterContext.
  if (!props.createElement) {
    return { ...props, createElement: (C, props) => <C {...props} /> };
  }

  return props;
}

const init = () => {
  render(
    <Provider store={store}>
      <div>
        <Router
          history={history}
          onUpdate={logPageView}
          dispatch={store.dispatch}
          render={props => <LoadingRouterContext {...fillInMissingProps(props)} />}
        >
          <Route
            path="/logout"
            component={Logout}
          />
          <Route
            path="/linodes/:linodeLabel/weblish"
            component={Weblish}
          />
          {Styleguide}
          <Route
            onChange={() => store.dispatch(hideModal())}
            path="/"
            component={Layout}
          >
            <IndexRedirect to="/linodes" />
            {Linodes}
            {NodeBalancers}
            {Domains}
            {Profile}
            {Users}
            {Billing}
            {Settings}
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
