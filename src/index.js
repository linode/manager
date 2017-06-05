import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import ReactGA from 'react-ga';
import reactGuard from 'react-guard';
import { Provider } from 'react-redux';
import { Router, Route, IndexRedirect, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

import { InternalError, NotFound } from 'linode-components/errors';
import { ModalShell } from 'linode-components/modals';
import Styleguide from 'linode-styleguide';

import { setError } from '~/actions/errors';
import { hideModal, showModal } from '~/actions/modal';
import { actions, thunks, reducer } from '~/api/configs/linodes';
import Billing from '~/billing';
import DevTools from '~/components/DevTools';
import { GA_ID } from '~/constants';
import Domains from '~/domains';
import { rawFetch } from '~/fetch';
import Layout from '~/layouts/Layout';
import Logout from '~/layouts/Logout';
import OAuthCallbackPage from '~/layouts/OAuth';
import Linodes from '~/linodes';
import Weblish from '~/linodes/linode/layouts/Weblish';
import NodeBalancers from '~/nodebalancers';
import Profile from '~/profile';
import { LoadingRouterContext } from '~/router';
import * as session from '~/session';
import Settings from '~/settings';
import { store } from '~/store';
import Support from '~/support';
import Users from '~/users';

// eslint-disable-next-line no-unused-vars
import styles from '../scss/manager.scss';


const history = syncHistoryWithStore(browserHistory, store);
store.dispatch(session.initialize);

window.actions = actions; window.thunks = thunks; window.reducer = reducer;

ReactGA.initialize(GA_ID); // eslint-disable-line no-undef
function logPageView() {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
}

function fillInMissingProps(props) {
  // This randomly started not being passed in but is required by RouterContext.
  if (!props.createElement) {
    return { ...props, createElement: React.createElement };
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
          <Route path="oauth">
            <Route path="callback" component={OAuthCallbackPage} />
          </Route>
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

window.logerror = function(msg, source, lineNo, colNo, error = {}, component = {}) {
  const options = {
    method: 'POST',
    body: JSON.stringify({
      error: {
        msg,
        source,
        lineNo,
        colNo,
        stack: error.stack,
      },
      navigator: {
        ...window.navigator,
      },
      component: {
        state: component.state,
        props: component.props,
        name: component.displayName,
      },
      state: store.getState(),
    }),
  };

  rawFetch('/error', options).catch(function(e) {
    console.error(e);
  });
};

window.onerror = function(...args) {
  try {
    console.error(...args);

    // TODO: if we hit an error, any future page changes should trigger a full page load.
    store.dispatch(setError(...args));

    render(
      <ModalShell
        open
        title={'Oh no! This page is broken.'}
      >
        {/* Yes, we could use window.reload() but we've already got this utility function that
        * can be stubbed out. */}
        <InternalError
          returnHome={() => session.redirect(window.location.pathname)}
        />
      </ModalShell>,
         document.getElementById('emergency-modal'),
    );
  } finally {
    window.logerror(...args);
  }
};

// React is not in a great state right now w.r.t. error handling in render functions.
// Here is a thread discussing current workarounds: https://github.com/facebook/react/issues/2461
// react-guard is a solution presented there and seems good enough for now.
reactGuard(React, function(error, component) {
  window.onerror(error.message, '', 0, 0, error, component);

  return null;
});
