import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import createBrowserHistory from 'history/createBrowserHistory';

import isPathOneOf from 'src/utilities/routing/isPathOneOf';
import store from 'src/store';
import { isProduction, GA_ID } from 'src/constants';
import analytics from 'src/analytics';

import 'src/exceptionReporting';

import AuthenticationWrapper from 'src/components/AuthenticationWrapper';
import OAuthCallbackPage from 'src/layouts/OAuth';
import Logout from 'src/layouts/Logout';
import { initialize as sessionInitialize, initializeSessionRefresh } from './session';
import App from './App';
import './index.css';

/**
 * Initialize Analytics.
 */
analytics(GA_ID, isProduction);

/**
 * Send pageviews unless blacklisted.
 */
createBrowserHistory().listen(({ pathname }) => {
  /** https://palantir.github.io/tslint/rules/strict-boolean-expressions/ */
  if ((window as any).ga && isPathOneOf(['/oauth'], pathname) === false) {
    (window as any).ga('send', 'pageview');
  }
});

sessionInitialize();
initializeSessionRefresh();

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <AuthenticationWrapper>
        <Switch>
          <Route exact path="/oauth/callback" component={OAuthCallbackPage} />
          <Route exact path="/null" render={() => <span>null route</span>} />
          <Route exact path="/logout" component={Logout} />
          <Route component={App} />
        </Switch>
      </AuthenticationWrapper>
    </Router>
  </Provider>,
  document.getElementById('root') as HTMLElement,
);
