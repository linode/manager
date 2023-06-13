import 'font-logos/assets/font-logos.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider as ReduxStoreProvider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { initAnalytics, initTagManager } from 'src/analytics';
import AuthenticationWrapper from 'src/components/AuthenticationWrapper';
import CookieWarning from 'src/components/CookieWarning';
import SnackBar from 'src/components/SnackBar';
import SplashScreen from 'src/components/SplashScreen';
import { GA_ID, GTM_ID, isProductionBuild } from 'src/constants';
import 'src/exceptionReporting';
import Logout from 'src/layouts/Logout';
import { setupInterceptors } from 'src/request';
import { storeFactory } from 'src/store';
import './index.css';
import LinodeThemeWrapper from './LinodeThemeWrapper';
import loadDevTools from './dev-tools/load';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import App from './App';
import { queryClientFactory } from './queries/base';

const queryClient = queryClientFactory();
const store = storeFactory(queryClient);

setupInterceptors(store);

const Lish = React.lazy(() => import('src/features/Lish'));
const CancelLanding = React.lazy(
  () => import('src/features/CancelLanding/CancelLanding')
);
const LoginAsCustomerCallback = React.lazy(
  () => import('src/layouts/LoginAsCustomerCallback')
);
const OAuthCallbackPage = React.lazy(() => import('src/layouts/OAuth'));

/*
 * Initialize Analytic and Google Tag Manager
 */
initAnalytics(isProductionBuild, GA_ID);

initTagManager(GTM_ID);

const NullAuth = () => <span>null auth route</span>;

const Null = () => <span>null route</span>;

const AppWrapper = () => (
  <>
    <SplashScreen />
    <SnackBar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      maxSnack={3}
      autoHideDuration={4000}
      data-qa-toast
      hideIconVariant={true}
    >
      <App />
    </SnackBar>
  </>
);

const ContextWrapper = () => (
  <ReduxStoreProvider store={store}>
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
            <Route exact path="/nullauth" component={NullAuth} />
            <Route exact path="/logout" component={Logout} />
            <Route exact path="/cancel" component={CancelLanding} />
            <AuthenticationWrapper>
              <Switch>
                <Route path="/linodes/:linodeId/lish/:type" component={Lish} />
                <Route component={AppWrapper} />
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
  </ReduxStoreProvider>
);

// Thanks to https://kentcdodds.com/blog/make-your-own-dev-tools
//
// Load dev tools if need be.
loadDevTools(store, () => {
  ReactDOM.render(
    navigator.cookieEnabled ? (
      <Router>
        <Switch>
          {/* A place to go that prevents the app from loading while injecting OAuth tokens */}
          <Route exact path="/null" component={Null} />
          <Route component={ContextWrapper} />
        </Switch>
      </Router>
    ) : (
      <CookieWarning />
    ),
    document.getElementById('root') as HTMLElement
  );
});
