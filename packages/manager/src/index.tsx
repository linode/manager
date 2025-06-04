import { queryClientFactory } from '@linode/queries';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxStoreProvider } from 'react-redux';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import { CookieWarning } from 'src/components/CookieWarning';
import { Snackbar } from 'src/components/Snackbar/Snackbar';
import 'src/exceptionReporting';
import { SplashScreen } from 'src/components/SplashScreen';
import Logout from 'src/layouts/Logout';
import { setupInterceptors } from 'src/request';
import { storeFactory } from 'src/store';

import { App } from './App';
import './index.css';
import { ENABLE_DEV_TOOLS } from './constants';
import { LinodeThemeWrapper } from './LinodeThemeWrapper';
import { useOAuth } from './OAuth/utils';

const Lish = React.lazy(() => import('src/features/Lish'));

const CancelLanding = React.lazy(() =>
  import('src/features/CancelLanding/CancelLanding').then((module) => ({
    default: module.CancelLanding,
  }))
);

const LoginAsCustomerCallback = React.lazy(() =>
  import('src/layouts/LoginAsCustomerCallback').then((module) => ({
    default: module.LoginAsCustomerCallback,
  }))
);
const OAuthCallbackPage = React.lazy(() => import('src/layouts/OAuth'));

const queryClient = queryClientFactory('longLived');
const store = storeFactory();

setupInterceptors(store);

const Routes = () => {
  const { isPendingAuthentication } = useOAuth();

  if (isPendingAuthentication) {
    return (
      <React.Suspense fallback={<SplashScreen />}>
        <Switch>
          <Route component={OAuthCallbackPage} exact path="/oauth/callback" />
          <Route
            component={LoginAsCustomerCallback}
            exact
            path="/admin/callback"
          />
          <Route component={Logout} exact path="/logout" />
          <Route component={CancelLanding} exact path="/cancel" />
        </Switch>
      </React.Suspense>
    );
  }

  return (
    <React.Suspense fallback={<SplashScreen />}>
      <Switch>
        <Route component={Logout} exact path="/logout" />
        <Route component={CancelLanding} exact path="/cancel" />
        <Route component={Lish} path="/linodes/:linodeId/lish/:type" />
        <Route component={App} />
      </Switch>
    </React.Suspense>
  );
};

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
              <Snackbar
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                autoHideDuration={4000}
                hideIconVariant={false}
                maxSnack={3}
              >
                <Routes />
              </Snackbar>
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
    await devTools.loadDevTools();

    const { DevTools } = await import('./dev-tools/DevTools');

    const devToolsRootContainer = document.createElement('div');
    devToolsRootContainer.id = 'dev-tools-root';
    document.body.appendChild(devToolsRootContainer);

    const root = createRoot(devToolsRootContainer);

    root.render(<DevTools queryClient={queryClient} store={store} />);
  }

  const container = document.getElementById('root');
  createRoot(container!).render(<Main />);
}

loadApp();
