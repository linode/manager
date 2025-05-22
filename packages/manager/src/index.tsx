import { queryClientFactory } from '@linode/queries';
import { getRoot } from '@linode/utilities';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { Provider as ReduxStoreProvider } from 'react-redux';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import { CookieWarning } from 'src/components/CookieWarning';
import { Snackbar } from 'src/components/Snackbar/Snackbar';
import { SplashScreen } from 'src/components/SplashScreen';
import 'src/exceptionReporting';
import Logout from 'src/layouts/Logout';
import { setupInterceptors } from 'src/request';
import { storeFactory } from 'src/store';

import { App } from './App';
import NullComponent from './components/NullComponent';
import { ENABLE_DEV_TOOLS } from './constants';
import './index.css';
import { LinodeThemeWrapper } from './LinodeThemeWrapper';
import { createRoot } from 'react-dom/client';

const queryClient = queryClientFactory('longLived');
const store = storeFactory();

setupInterceptors(store);

const Lish = React.lazy(() => import('src/features/Lish'));

const CancelLanding = React.lazy(() =>
  import('src/features/CancelLanding/CancelLanding').then((module) => ({
    default: module.CancelLanding,
  }))
);

const LoginAsCustomerCallback = React.lazy(
  () => import('src/layouts/LoginAsCustomerCallback')
);
const OAuthCallbackPage = React.lazy(() => import('src/layouts/OAuth'));

const Main = () => {
  if (!navigator.cookieEnabled) {
    return <CookieWarning />;
  }

  return (
    <ReduxStoreProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <LinodeThemeWrapper>
          <CssBaseline enableColorScheme />
          <React.Suspense fallback={<SplashScreen />}>
            <Router>
              <Switch>
                <Route
                  component={OAuthCallbackPage}
                  exact
                  path="/oauth/callback"
                />
                <Route
                  component={LoginAsCustomerCallback}
                  exact
                  path="/admin/callback"
                />
                {/* A place to go that prevents the app from loading while refreshing OAuth tokens */}
                <Route component={NullComponent} exact path="/nullauth" />
                <Route component={Logout} exact path="/logout" />
                <Route component={CancelLanding} exact path="/cancel" />
                <Snackbar
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  autoHideDuration={4000}
                  hideIconVariant={false}
                  maxSnack={3}
                >
                  <Switch>
                    <Route
                      component={Lish}
                      path="/linodes/:linodeId/lish/:type"
                    />
                    <Route component={App} />
                  </Switch>
                </Snackbar>
              </Switch>
            </Router>
          </React.Suspense>
        </LinodeThemeWrapper>
      </QueryClientProvider>
    </ReduxStoreProvider>
  );
};

async function loadApp() {
  if (ENABLE_DEV_TOOLS) {
    const devTools = await import('./dev-tools/load');
    await devTools.loadDevTools(store, queryClient);
  }

  const container = document.getElementById('root');
  createRoot(container!).render(<Main />);
}

loadApp();
