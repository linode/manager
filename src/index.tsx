import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import 'font-logos/assets/font-logos.css';

import createBrowserHistory from 'history/createBrowserHistory';

import isPathOneOf from 'src/utilities/routing/isPathOneOf';
import store from 'src/store';
import { isProduction, GA_ID } from 'src/constants';
import analytics from 'src/analytics';

import 'src/exceptionReporting';

import AuthenticationWrapper from 'src/components/AuthenticationWrapper';
import OAuthCallbackPage from 'src/layouts/OAuth';
import Logout from 'src/layouts/Logout';
import {
  initialize as sessionInitialize,
  refreshOAuthToken,
  refreshOAuthOnUserInteraction,
} from './session';

import 'src/utilities/request';
import DefaultLoader from 'src/components/DefaultLoader';

import App from './App';
import './index.css';

import './events';

const Weblish = DefaultLoader({
  loader: () => import('src/features/Weblish'),
});

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
if (!(isPathOneOf(['/oauth', '/null', '/login'], window.location.pathname))) {
  refreshOAuthToken();
}
refreshOAuthOnUserInteraction();

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Switch>
        {/* A place to go that prevents the app from loading while injecting OAuth tokens */}
        <Route exact path="/null" render={() => <span>null route</span>} />
        <Route render={() =>
          <AuthenticationWrapper>
            <Switch>
              <Route exact path="/linodes/:linodeId/weblish" component={Weblish} />
              <Route exact path="/oauth/callback" component={OAuthCallbackPage} />
              {/* A place to go that prevents the app from loading while refreshing OAuth tokens */}
              <Route exact path="/nullauth" render={() => <span>null auth route</span>} />
              <Route exact path="/logout" component={Logout} />
              <Route component={App} />
            </Switch>
          </AuthenticationWrapper>
        }/>
      </Switch>
    </Router>
  </Provider>,
  document.getElementById('root') as HTMLElement,
);
