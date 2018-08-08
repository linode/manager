import 'font-logos/assets/font-logos.css';
import createBrowserHistory from 'history/createBrowserHistory';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import analytics from 'src/analytics';
import AuthenticationWrapper from 'src/components/AuthenticationWrapper';
import DefaultLoader from 'src/components/DefaultLoader';
import { GA_ID, isProduction } from 'src/constants';
import 'src/exceptionReporting';
import Logout from 'src/layouts/Logout';
import OAuthCallbackPage from 'src/layouts/OAuth';
import store from 'src/store';
import 'src/utilities/createImageBitmap';
import 'src/utilities/request';
import isPathOneOf from 'src/utilities/routing/isPathOneOf';

import App from './App';
import './events';
import './index.css';
import LinodeThemeWrapper from './LinodeThemeWrapper';
import { initialize as sessionInitialize, refreshOAuthOnUserInteraction, refreshOAuthToken } from './session';

// import { whyDidYouUpdate } from 'why-did-you-update';
// whyDidYouUpdate(React);

const Lish = DefaultLoader({
  loader: () => import('src/features/Lish'),
});

/*
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
              <Route path="/linodes/:linodeId/lish" render={() =>
                <LinodeThemeWrapper>
                  <Lish />
                </LinodeThemeWrapper>
              }/>
              <Route exact path="/oauth/callback" component={OAuthCallbackPage} />
              {/* A place to go that prevents the app from loading while refreshing OAuth tokens */}
              <Route exact path="/nullauth" render={() => <span>null auth route</span>} />
              <Route exact path="/logout" component={Logout} />
              <Route render={() =>
                <LinodeThemeWrapper>
                  <App />
                </LinodeThemeWrapper>
              }/>
            </Switch>
          </AuthenticationWrapper>
        }/>
      </Switch>
    </Router>
  </Provider>,
  document.getElementById('root') as HTMLElement,
);
