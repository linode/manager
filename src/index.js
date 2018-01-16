import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import reactGuard from 'react-guard';
import { Provider } from 'react-redux';
import Raven from 'raven-js';
import { Switch, Route, Redirect } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';
import NotFound from 'linode-components/dist/errors/NotFound';
import Loadable from 'react-loadable';

import ClickCapture from '~/components/ClickCapture';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';
import Logout from '~/components/Logout';
import OAuthComponent from '~/layouts/OAuth';

import handleError from './handleError';
import { GA_ID, ENVIRONMENT, SENTRY_URL } from '~/constants';
import { init as initAnalytics } from './analytics';
import * as session from '~/session';
import { store, history } from '~/store';
import { isPathOneOf } from '~/utilities';
import PageLoader from '~/components/loaders/PageLoader';

const Linodes = Loadable({
  loader: () => import('./linodes'),
  loading: PageLoader,
});

const NodeBalancers = Loadable({
  loader: () => import('./nodebalancers'),
  loading: PageLoader,
});

const Domains = Loadable({
  loader: () => import('./domains'),
  loading: PageLoader,
});

const Support = Loadable({
  loader: () => import('./support'),
  loading: PageLoader,
});

const StackScripts = Loadable({
  loader: () => import('./stackscripts'),
  loading: PageLoader,
});

const Images = Loadable({
  loader: () => import('./images'),
  loading: PageLoader,
});

const Volumes = Loadable({
  loader: () => import('./volumes'),
  loading: PageLoader,
});

const Billing = Loadable({
  loader: () => import('./billing'),
  loading: PageLoader,
});

const Profile = Loadable({
  loader: () => import('./profile'),
  loading: PageLoader,
});

const Settings = Loadable({
  loader: () => import('./settings'),
  loading: PageLoader,
});

const Users = Loadable({
  loader: () => import('./users'),
  loading: PageLoader,
});

import Navigation from '~/layouts/Navigation';
import ContextNavigation from '~/layouts/ContextNavigation';
import Footer from '~/layouts/Footer';
import MiniHeader from '~/layouts/MiniHeader';

import AuthenticationWrapper from '~/components/AuthenticationWrapper';

/**
 * @todo I believe we can just import without defining a variable.
 */
import styles from '../scss/manager.scss'; // eslint-disable-line no-unused-vars

/**
 * Page View Analytics
 */
initAnalytics(ENVIRONMENT, GA_ID);
history.listen(({ pathname }) => {
  if (!isPathOneOf(['/oauth'], pathname)) {
    window.ga('send', 'pageview');
  }
});

window.handleError = handleError(history);

store.dispatch(session.initialize);


if (ENVIRONMENT === 'production') {
  Raven
    .config(SENTRY_URL)
    .install();
}

const init = () => {
  try {
    render(
      <Provider store={store}>
        <ClickCapture>
          <ConnectedRouter history={history}>
            <div>
              <AuthenticationWrapper>
                <div className="Layout" >
                  <ChainedDocumentTitle title="Linode Manager" />
                  <div className="Layout-inner">
                    {/* <ModalShell
                      open={modal.open}
                      title={modal.title}
                      close={() => hideModal()}
                    >
                      {modal.body}
                    </ModalShell> */}
                    <div className="Header">
                      <MiniHeader />
                      <Navigation />
                      <ContextNavigation />
                    </div>
                    <Switch>
                      <Route path="/linodes" component={Linodes} />
                      <Route path="/nodebalancers" component={NodeBalancers} />
                      <Route path="/domains" component={Domains} />
                      <Route path="/support" component={Support} />
                      <Route path="/support" component={Support} />
                      <Route path="/stackscripts" component={StackScripts} />
                      <Route path="/images" component={Images} />
                      <Route path="/volumes" component={Volumes} />
                      <Route path="/billing" component={Billing} />
                      <Route path="/profile" component={Profile} />
                      <Route path="/settings" component={Settings} />
                      <Route path="/users" component={Users} />
                      <Route exact path="/" render={() => (<Redirect to="/linodes" />)} />
                      <Route exact path="/logout" component={Logout} />
                      <Route exact path="/oauth/callback" component={OAuthComponent} />
                      <Route component={NotFound} />
                    </Switch>
                  </div>
                  <Footer />
                </div>
              </AuthenticationWrapper>
            </div>
          </ConnectedRouter>
        </ClickCapture>
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
