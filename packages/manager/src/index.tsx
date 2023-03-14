import 'font-logos/assets/font-logos.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import {
  BrowserRouter as Router,
  Route,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import { initAnalytics, initTagManager } from 'src/analytics';
import AuthenticationWrapper from 'src/components/AuthenticationWrapper';
import CookieWarning from 'src/components/CookieWarning';
import SnackBar from 'src/components/SnackBar';
import SplashScreen from 'src/components/SplashScreen';
import { GA_ID, GTM_ID, isProductionBuild } from 'src/constants';
import 'src/exceptionReporting';
import Logout from 'src/layouts/Logout';
import 'src/request';
import store from 'src/store';
import './index.css';
import LinodeThemeWrapper from './LinodeThemeWrapper';
import loadDevTools from './dev-tools/load';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { queryClient } from './queries/base';
import App from './App';

const Lish = React.lazy(() => import('src/features/Lish'));
const Cancel = React.lazy(() => import('src/features/CancelLanding'));
const LoginAsCustomerCallback = React.lazy(
  () => import('src/layouts/LoginAsCustomerCallback')
);
const OAuthCallbackPage = React.lazy(() => import('src/layouts/OAuth'));

/*
 * Initialize Analytic and Google Tag Manager
 */
initAnalytics(isProductionBuild, GA_ID);

initTagManager(GTM_ID);

const renderNullAuth = () => <span>null auth route</span>;

const renderNull = () => <span>null route</span>;

const renderApp = (props: RouteComponentProps) => (
  <>
    <SplashScreen />
    <SnackBar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      maxSnack={3}
      autoHideDuration={4000}
      data-qa-toast
      hideIconVariant={true}
    >
      <App location={props.location} history={props.history} />
    </SnackBar>
  </>
);

const renderAuthentication = () => (
  <QueryClientProvider client={queryClient}>
    <LinodeThemeWrapper>
      <React.Suspense fallback={<SplashScreen />}>
        <Switch>
          <Route exact path="/oauth/callback" component={OAuthCallbackPage} />
          <Route
            exact
            path="/admin/callback"
            component={LoginAsCustomerCallback}
          />
          {/* A place to go that prevents the app from loading while refreshing OAuth tokens */}
          <Route exact path="/nullauth" render={renderNullAuth} />
          <Route exact path="/logout" component={Logout} />
          <Route exact path="/cancel" component={Cancel} />
          <AuthenticationWrapper>
            <Switch>
              <Route path="/linodes/:linodeId/lish/:type" component={Lish} />
              <Route render={renderApp} />
            </Switch>
          </AuthenticationWrapper>
        </Switch>
      </React.Suspense>
    </LinodeThemeWrapper>
    <ReactQueryDevtools
      initialIsOpen={false}
      toggleButtonProps={{ style: { marginLeft: '3em' } }}
    />
  </QueryClientProvider>
);

// Thanks to https://kentcdodds.com/blog/make-your-own-dev-tools
//
// Load dev tools if need be.
loadDevTools(() => {
  ReactDOM.render(
    navigator.cookieEnabled ? (
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
    ),
    document.getElementById('root') as HTMLElement
  );
});
