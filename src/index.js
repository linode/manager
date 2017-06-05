import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import ReactGA from 'react-ga';
import reactGuard from 'react-guard';
import { Provider } from 'react-redux';
import { Router, Route, IndexRedirect, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import TraceKit from 'tracekit';

import { InternalError, NotFound } from 'linode-components/errors';
import { ModalShell } from 'linode-components/modals';
import Styleguide from 'linode-styleguide';

import { setError } from '~/actions/errors';
import { hideModal } from '~/actions/modal';
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

window.handleError = function (e, component = {}) {
  try {
    // eslint-disable-next-line no-console
    console.trace(e);

    store.dispatch(setError(e));

    // If we hit an error, any future page changes should trigger a full page load.
    const errorPagePathname = window.location.pathname;
    history.listen(function (location) {
      if (location.pathname !== errorPagePathname) {
        session.redirect(location.pathname);
      }
    });

    if (e.status !== 404) {
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
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.trace(e);
  }

  // eslint-disable-next-line no-param-reassign
  e.component = {
    props: component.props,
    state: component.state,
    displayName: component.displayName,
  };

  // TraceKit.report throws an error.
  try {
    TraceKit.report(e);
  } catch (newE) {
    if (newE !== e) {
      throw newE;
    }
  }
};

const init = () => {
  try {
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
  } catch (e) {
    window.handleError(e);
  }
};

window.init = init;

TraceKit.report.subscribe(function (error) {
  const state = store.getState();
  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      error,
      navigator: {
        userAgent: window.navigator.userAgent,
        language: window.navigator.language,
      },
      state: {
        ...state,
        authentication: { ...state.authentication, token: 'REDACTED' },
      },
    }),
  };

  rawFetch('/error', options).catch(function (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  });
});

// React is not in a great state right now w.r.t. error handling in render functions.
// Here is a thread discussing current workarounds: https://github.com/facebook/react/issues/2461
// react-guard is a solution presented there and seems good enough for now.
reactGuard(React, window.handleError);
