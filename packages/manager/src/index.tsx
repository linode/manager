import 'font-logos/assets/font-logos.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import {
  BrowserRouter as Router,
  Route,
  RouteProps,
  Switch
} from 'react-router-dom';
import { initAnalytics, initTagManager } from 'src/analytics';
import AuthenticationWrapper from 'src/components/AuthenticationWrapper';
import CookieWarning from 'src/components/CookieWarning';
import DefaultLoader from 'src/components/DefaultLoader';
import SnackBar from 'src/components/SnackBar';
import { GA_ID, GA_ID_2, GTM_ID, isProduction } from 'src/constants';
import 'src/exceptionReporting';
import LoginAsCustomerCallback from 'src/layouts/LoginAsCustomerCallback';
import Logout from 'src/layouts/Logout';
import store from 'src/store';
import 'src/utilities/createImageBitmap';
import 'src/utilities/request';
import './index.css';
import LinodeThemeWrapper from './LinodeThemeWrapper';

import SplashScreen from 'src/components/SplashScreen';

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
initAnalytics(
  isProduction,
  {
    id: GA_ID
  },
  {
    id: GA_ID_2,
    name: 'linodecom'
  }
);
initTagManager(GTM_ID);

const renderNullAuth = () => <span>null auth route</span>;

const renderNull = () => <span>null route</span>;

const renderLish = () => (
  <LinodeThemeWrapper>{toggle => <Lish />}</LinodeThemeWrapper>
);

const renderApp = (props: RouteProps) => (
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

ReactDOM.render(
  <React.Fragment>
    {navigator.cookieEnabled ? (
      <Provider store={store}>
        <Router>
          <Switch>
            {/* A place to go that prevents the app from loading while injecting OAuth tokens */}
            <Route exact path="/null" render={renderNull} />
            <Route render={renderAuthentication} />
          </Switch>
        </Router>
      </Provider>
    ) : (
      <CookieWarning />
    )}
  </React.Fragment>,
  document.getElementById('root') as HTMLElement
);

if (module.hot && !isProduction) {
  module.hot.accept();
}
