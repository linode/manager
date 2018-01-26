import 'babel-polyfill';
import React, { Fragment } from 'react';
import { render } from 'react-dom';
import reactGuard from 'react-guard';
import { Provider } from 'react-redux';
import Raven from 'raven-js';
import { Switch, Route, Redirect } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';
import Loadable from 'react-loadable';
import NotFound from 'linode-components/dist/errors/NotFound';

import OAuthComponent from '~/layouts/OAuth';
import Navigation from '~/layouts/Navigation';
import MiniHeader from '~/layouts/MiniHeader';
import Footer from '~/layouts/Footer';
import ClickCapture from '~/components/ClickCapture';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';
import PageLoader from '~/components/loaders/PageLoader';
import Logout from '~/components/Logout';
import AuthenticationWrapper from '~/components/AuthenticationWrapper';
import Banners from '~/components/Banners';

import handleError from '~/handleError';
import { GA_ID, ENVIRONMENT, SENTRY_URL } from '~/constants';
import { init as initAnalytics } from '~/analytics';
import * as session from '~/session';
import { store, history } from '~/store';
import { isPathOneOf } from '~/utilities';
import ContextNavigation from '~/layouts/ContextNavigation';
import ModalContainer from '~/components/ModalContainer';

const Linodes = Loadable({
  loader: () => import('./linodes'),
  loading: PageLoader,
});

const Glish = Loadable({
  loader: () => import('./linodes/linode/layouts/Glish'),
  loading: PageLoader,
});

const Weblish = Loadable({
  loader: () => import('./linodes/linode/layouts/Weblish'),
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


try {
  render(
    <Provider store={store}>
      <ClickCapture>
        <ConnectedRouter history={history}>
          <AuthenticationWrapper>
            <Switch>
              <Route exact path="/linodes/:linodeLabel/glish" component={Glish} />
              <Route exact path="/linodes/:linodeLabel/weblish" component={Weblish} />
              <Route exact path="/oauth/callback" component={OAuthComponent} />
              <Route exact path="/logout" component={Logout} />
              <Route
                render={() => (
                  <Fragment>
                    <ChainedDocumentTitle title="Linode Manager" />
                    <div className="Layout-inner">
                      <ModalContainer />
                      <div className="Header">
                        <MiniHeader />
                        <Navigation />
                        <ContextNavigation />
                      </div>
                      <div className="main">
                        <Route render={(matchProps) => <Banners {...matchProps} />} />
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
                          <Route component={NotFound} />
                        </Switch>
                      </div>
                    </div>
                    <Footer />
                  </Fragment>
                )
                }
              />
            </Switch>
          </AuthenticationWrapper>
        </ConnectedRouter>
      </ClickCapture>
    </Provider>,
    document.getElementById('root')
  );
} catch (e) {
  window.handleError(e);
}

// React is not in a great state right now w.r.t. error handling in render functions.
// Here is a thread discussing current workarounds: https://github.com/facebook/react/issues/2461
// react-guard is a solution presented there and seems good enough for now.
reactGuard(React, window.handleError);
