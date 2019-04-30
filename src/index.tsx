import 'font-logos/assets/font-logos.css';
import createBrowserHistory from 'history/createBrowserHistory';
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
import DefaultLoader from 'src/components/DefaultLoader';
import SnackBar from 'src/components/SnackBar';
import { GA_ID, GTM_ID, isProduction } from 'src/constants';
import 'src/exceptionReporting';
import LoginAsCustomerCallback from 'src/layouts/LoginAsCustomerCallback';
import Logout from 'src/layouts/Logout';
import OAuthCallbackPage from 'src/layouts/OAuth';
import store from 'src/store';
import 'src/utilities/createImageBitmap';
import { sendCurrentThemeSettingsEvent } from 'src/utilities/ga';
import 'src/utilities/request';
import isPathOneOf from 'src/utilities/routing/isPathOneOf';
import { spacing as spacingChoice, theme } from 'src/utilities/storage';
import App from './App';
import './events';
import './index.css';
import LinodeThemeWrapper from './LinodeThemeWrapper';

const Lish = DefaultLoader({
  loader: () => import('src/features/Lish')
});

/*
 * Initialize Analytic and Google Tag Manager
 */
initAnalytics(GA_ID, isProduction);
initTagManager(GTM_ID);

const themeChoice = theme.get() === 'dark' ? 'Dark Theme' : 'Light Theme';
const spacingMode =
  spacingChoice.get() === 'compact' ? 'Compact Mode' : 'Normal Mode';

sendCurrentThemeSettingsEvent(`${themeChoice} | ${spacingMode}`);

/**
 * Send pageviews unless blacklisted.
 */
createBrowserHistory().listen(({ pathname }) => {
  /** https://palantir.github.io/tslint/rules/strict-boolean-expressions/ */
  if ((window as any).ga && isPathOneOf(['/oauth'], pathname) === false) {
    (window as any).ga('send', 'pageview');
  }
});

const renderNullAuth = () => <span>null auth route</span>;

const renderNull = () => <span>null route</span>;

const renderLish = () => (
  <LinodeThemeWrapper>{toggle => <Lish />}</LinodeThemeWrapper>
);

const renderApp = (props: RouteProps) => (
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
);

const renderAuthentication = () => (
  <Switch>
    <Route exact path="/oauth/callback" component={OAuthCallbackPage} />
    <Route exact path="/admin/callback" component={LoginAsCustomerCallback} />
    {/* A place to go that prevents the app from loading while refreshing OAuth tokens */}
    <Route exact path="/nullauth" render={renderNullAuth} />
    <Route exact path="/logout" component={Logout} />
    <AuthenticationWrapper>
      <Switch>
        <Route path="/linodes/:linodeId/lish" render={renderLish} />
        <Route render={renderApp} />
      </Switch>
    </AuthenticationWrapper>
  </Switch>
);

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Switch>
        {/* A place to go that prevents the app from loading while injecting OAuth tokens */}
        <Route exact path="/null" render={renderNull} />
        <Route render={renderAuthentication} />
      </Switch>
    </Router>
  </Provider>,
  document.getElementById('root') as HTMLElement
);
