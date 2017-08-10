import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import reactGuard from 'react-guard';
import { Provider } from 'react-redux';
import { Router, Route, IndexRedirect, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import Raven from 'raven-js';

import { InternalError, NotFound } from 'linode-components/errors';
import { ModalShell } from 'linode-components/modals';

import { setError } from '~/actions/errors';
import { hideModal } from '~/actions/modal';
import { actions, thunks, reducer } from '~/api/configs/linodes';
import Billing from '~/billing';
import DevTools from '~/components/DevTools';
import { GA_ID, ENVIRONMENT, SENTRY_URL } from '~/constants';
import { init as initAnalytics } from './analytics';
import Domains from '~/domains';
import Layout from '~/layouts/Layout';
import Logout from '~/layouts/Logout';
import OAuthCallbackPage from '~/layouts/OAuth';
import Linodes from '~/linodes';
import StackScripts from '~/linodes/stackscripts';
import Weblish from '~/linodes/linode/layouts/Weblish';
import NodeBalancers from '~/nodebalancers';
import Profile from '~/profile';
import { LoadingRouterContext } from '~/router';
import * as session from '~/session';
import Settings from '~/settings';
import { store } from '~/store';
import Support from '~/support';
import Users from '~/users';
import Volumes from '~/linodes/volumes';
import Images from '~/linodes/images';

// eslint-disable-next-line no-unused-vars
import styles from '../scss/manager.scss';


const history = syncHistoryWithStore(browserHistory, store);
store.dispatch(session.initialize);

window.actions = actions; window.thunks = thunks; window.reducer = reducer;

initAnalytics(ENVIRONMENT, GA_ID);
if (ENVIRONMENT === 'production') {
  Raven
    .config(SENTRY_URL)
    .install();
}

// TODO: move to analytics
function onPageChange() {
  // Log page views.
  if (window.location.pathname.indexOf('/oauth') !== 0) {
    window.ga('send', 'pageview');
  }
}

function fillInMissingProps(props) {
  // This randomly started not being passed in but is required by RouterContext.
  if (!props.createElement) {
    return { ...props, createElement: React.createElement };
  }

  return props;
}

window.handleError = function (e) {
  Raven.captureException(e);

  try {
    // eslint-disable-next-line no-console
    console.error(e);

    store.dispatch(setError(e));

    // If we hit an error, any future page changes should trigger a full page load.
    const errorPagePathname = window.location.pathname;
    history.listen(function (location) {
      if (location.pathname !== errorPagePathname) {
        session.redirect(location.pathname);
      }
    });

    const ignoreStatuses = [404, 401];
    if (ignoreStatuses.indexOf(e.status) === -1) {
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
        document.getElementById('emergency-modal')
      );
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }

  // Needed for react-guard.
  return null;
};

const init = () => {
  try {
    render(
      <Provider store={store}>
        <div>
          <Router
            history={history}
            onUpdate={onPageChange}
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
            <Route
              onChange={() => store.dispatch(hideModal())}
              path="/"
              component={Layout}
            >
              <IndexRedirect to="/linodes" />
              {Linodes}
              {StackScripts}
              {NodeBalancers}
              {Domains}
              {Profile}
              {Users}
              {Billing}
              {Volumes}
              {Images}
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

// React is not in a great state right now w.r.t. error handling in render functions.
// Here is a thread discussing current workarounds: https://github.com/facebook/react/issues/2461
// react-guard is a solution presented there and seems good enough for now.
reactGuard(React, window.handleError);
