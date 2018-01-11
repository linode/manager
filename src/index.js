import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import reactGuard from 'react-guard';
import { Provider } from 'react-redux';
import Raven from 'raven-js';
import { Switch, Route, Redirect } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';
import NotFound from 'linode-components/dist/errors/NotFound';

import PollingWrapper from '~/components/PollingWrapper';
import ClickCapture from '~/components/ClickCapture';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';
// import { actions, thunks, reducer } from '~/api/generic/linodes';
import Logout from '~/components/Logout';
import OAuthComponent from '~/layouts/OAuth';

import handleError from './handleError';
import { GA_ID, ENVIRONMENT, SENTRY_URL } from '~/constants';
import { init as initAnalytics } from './analytics';
import * as session from '~/session';
import { store, history } from '~/store';
import { isPathOneOf } from '~/utilities';
import Linodes from '~/linodes';

import NavigationLink from '~/layouts/NavigationLink';
import Navigation from '~/layouts/Navigation';
import Footer from '~/layouts/Footer';
import MiniHeader from '~/layouts/MiniHeader';

import AuthenticationWrapper from '~/components/AuthenticationWrapper';
/**
 * Crazy important, so pay attention boys and girls;
 * Any react-redux connected component which uses a route component (Link, Route,
 * Redirect, etc.,...) you must wrapped the component withRouter.
 *
 * @see https://github.com/ReactTraining/react-router/issues/4671#issuecomment-285320076
 * @example
 *  export default compose(connect(), withRouter)(Component);
 */

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

// window.actions = actions; window.thunks = thunks; window.reducer = reducer;

if (ENVIRONMENT === 'production') {
  Raven
    .config(SENTRY_URL)
    .install();
}
/**
 * Features
 */
const LinodeContextMenu = () => {
  const links = [
    { to: '/stackscripts', label: 'StackScripts', linkClass: 'ContextHeader-link' },
    { to: '/images', label: 'Images', linkClass: 'ContextHeader-link' },
    { to: '/volumes', label: 'Volumes', linkClass: 'ContextHeader-link' },
  ];

  return (
    <div className="ContextHeader">
      <div className="container">
        <div className="Menu">
          {links.map((props, key) => (
            <div className="Menu-item" key={key}>
              {React.createElement(NavigationLink, props)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const ContextNavigation = () => (
  <div>
    <Route path="/linodes" render={LinodeContextMenu} />
    <Route path="/images" component={LinodeContextMenu} />
    <Route path="/stackscripts" component={LinodeContextMenu} />
    <Route path="/volumes" component={LinodeContextMenu} />
  </div>
);

const BlankPage = () => (<div>This page intentionally left blank.</div>);

const init = () => {
  try {
    render(
      <Provider store={store}>
        <ClickCapture>
          <ConnectedRouter history={history}>
            <div>
              <AuthenticationWrapper>
                <PollingWrapper />
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
                      {/* <Route path="/nodebalancers" component={NodeBalancers} />
                      <Route path="/domains" component={Domains} />
                      <Route path="/support" component={Support} />
                      <Route path="/stackscripts" component={Stackscripts} />
                      <Route path="/images" component={Images} />
                      <Route path="/volumes" component={Volumes} />
                      <Route path="/billing" component={Billing} />
                      <Route path="/profile" component={Profile} />
                      <Route path="/settings" component={Settings} />
                      <Route path="/users" component={Users} /> */}
                      <Route exact path="/" render={() => (<Redirect to="/linodes" />)} />
                      <Route path="/" exact component={BlankPage} />
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
