import 'font-logos/assets/font-logos.css';
import { asyncWithLDProvider } from 'launchdarkly-react-client-sdk';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import {
  BrowserRouter as Router,
  Route,
  RouteComponentProps,
  Switch
} from 'react-router-dom';
import { initAnalytics, initTagManager } from 'src/analytics';
import AuthenticationWrapper from 'src/components/AuthenticationWrapper';
import CookieWarning from 'src/components/CookieWarning';
import DefaultLoader from 'src/components/DefaultLoader';
import SnackBar from 'src/components/SnackBar';
import {
  GA_ID,
  GTM_ID,
  isProduction,
  LAUNCH_DARKLY_API_KEY
} from 'src/constants';
import 'src/exceptionReporting';
import LoginAsCustomerCallback from 'src/layouts/LoginAsCustomerCallback';
import Logout from 'src/layouts/Logout';
import 'src/request';
import store from 'src/store';
import 'src/utilities/createImageBitmap';
import './index.css';
import LinodeThemeWrapper from './LinodeThemeWrapper';

import SplashScreen from 'src/components/SplashScreen';
import { RenderChildren } from './utilities/RenderChildren';

const Lish = DefaultLoader({
  loader: () => import('src/features/Lish')
});

const App = DefaultLoader({
  loader: () => import('./App')
});

const OAuthCallbackPage = DefaultLoader({
  loader: () => import('src/layouts/OAuth')
});

const Cancel = DefaultLoader({
  loader: () => import('src/features/CancelLanding')
});

/*
 * Initialize Analytic and Google Tag Manager
 */
initAnalytics(isProduction, GA_ID);

initTagManager(GTM_ID);

const renderNullAuth = () => <span>null auth route</span>;

const renderNull = () => <span>null route</span>;

const renderLish = () => (
  <LinodeThemeWrapper>{() => <Lish />}</LinodeThemeWrapper>
);

const renderApp = (props: RouteComponentProps) => (
  <React.Fragment>
    <SplashScreen />
    <LinodeThemeWrapper>
      {(toggle, spacing) => (
        <SnackBar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          maxSnack={3}
          autoHideDuration={4000}
          data-qa-toast
          hideIconVariant={true}
        >
          <App
            toggleTheme={toggle}
            toggleSpacing={spacing}
            location={props.location}
            history={props.history}
          />
        </SnackBar>
      )}
    </LinodeThemeWrapper>
  </React.Fragment>
);

const renderCancel = () => (
  <LinodeThemeWrapper>
    <Cancel />
  </LinodeThemeWrapper>
);

const renderAuthentication = () => (
  <Switch>
    <Route exact path="/oauth/callback" component={OAuthCallbackPage} />
    <Route exact path="/admin/callback" component={LoginAsCustomerCallback} />
    {/* A place to go that prevents the app from loading while refreshing OAuth tokens */}
    <Route exact path="/nullauth" render={renderNullAuth} />
    <Route exact path="/logout" component={Logout} />
    <Route exact path="/cancel" render={renderCancel} />
    <AuthenticationWrapper>
      <Switch>
        <Route path="/linodes/:linodeId/lish" render={renderLish} />
        <Route render={renderApp} />
      </Switch>
    </AuthenticationWrapper>
  </Switch>
);

// Here we have an async "Self-executing anonymous function" so we can await
// the LD provider. We do this to prevent the app from rendering until we have
// feature flags available from LD. Otherwise the UI might be jumpy if it
// depends on feature flags.
// Documentation: https://docs.launchdarkly.com/docs/react-sdk-reference#section-async-with-ld-provider
(async () => {
  // Use the FeatureFlagProvider if an LD API key is supplied. Otherwise use
  // the stub RenderChildren component to wrap the app.
  const FeatureFlagProvider = LAUNCH_DARKLY_API_KEY
    ? await asyncWithLDProvider({
        clientSideID: LAUNCH_DARKLY_API_KEY,
        /**
         * Initialize the app with an anonymous user.
         */
        user: {
          key: 'anonymous',
          anonymous: true
        }
      })
    : RenderChildren;

  ReactDOM.render(
    <React.Fragment>
      {navigator.cookieEnabled ? (
        <FeatureFlagProvider>
          <Provider store={store}>
            <Router>
              <Switch>
                {/* A place to go that prevents the app from loading while injecting OAuth tokens */}
                <Route exact path="/null" render={renderNull} />
                <Route render={renderAuthentication} />
              </Switch>
            </Router>
          </Provider>
        </FeatureFlagProvider>
      ) : (
        <CookieWarning />
      )}
    </React.Fragment>,
    document.getElementById('root') as HTMLElement
  );
})();

if (module.hot && !isProduction) {
  module.hot.accept();
}
