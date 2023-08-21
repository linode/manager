import 'font-logos/assets/font-logos.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Provider as ReduxStoreProvider } from 'react-redux';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import AuthenticationWrapper from 'src/components/AuthenticationWrapper';
import { CookieWarning } from 'src/components/CookieWarning';
import { Snackbar } from 'src/components/Snackbar/Snackbar';
import SplashScreen from 'src/components/SplashScreen';
import 'src/exceptionReporting';
import Logout from 'src/layouts/Logout';
import { setupInterceptors } from 'src/request';
import { storeFactory } from 'src/store';

import { App } from './App';
import LinodeThemeWrapper from './LinodeThemeWrapper';
import { loadDevTools, shouldEnableDevTools } from './dev-tools/load';
import './index.css';
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

const NullAuth = () => <span>null auth route</span>;

const Null = () => <span>null route</span>;

const AppWrapper = () => (
  <>
    <SplashScreen />
    <Snackbar
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      autoHideDuration={4000}
      data-qa-toast
      hideIconVariant={true}
      maxSnack={3}
    >
      <App />
    </Snackbar>
  </>
);

const ContextWrapper = () => (
  <ReduxStoreProvider store={store}>
    <QueryClientProvider client={queryClient}>
      <LinodeThemeWrapper>
        <React.Suspense fallback={<SplashScreen />}>
          <Switch>
            <Route component={OAuthCallbackPage} exact path="/oauth/callback" />
            <Route
              component={LoginAsCustomerCallback}
              exact
              path="/admin/callback"
            />
            {/* A place to go that prevents the app from loading while refreshing OAuth tokens */}
            <Route component={NullAuth} exact path="/nullauth" />
            <Route component={Logout} exact path="/logout" />
            <Route component={CancelLanding} exact path="/cancel" />
            <AuthenticationWrapper>
              <Switch>
                <Route component={Lish} path="/linodes/:linodeId/lish/:type" />
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

const Main = () => {
  if (!navigator.cookieEnabled) {
    return <CookieWarning />;
  }

  return (
    <Router>
      <Switch>
        {/* A place to go that prevents the app from loading while injecting OAuth tokens */}
        <Route component={Null} exact path="/null" />
        <Route component={ContextWrapper} />
      </Switch>
    </Router>
  );
};

if (shouldEnableDevTools) {
  loadDevTools(store);
}

ReactDOM.render(<Main />, document.getElementById('root'));
