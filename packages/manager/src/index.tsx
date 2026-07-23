import { computeUiCoreApi } from '@akamai/compute-ui-core/api';
import { queryClientFactory } from '@linode/queries';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxStoreProvider } from 'react-redux';

import { CookieWarning } from 'src/components/CookieWarning';
import 'src/exceptionReporting';
import { SplashScreen } from 'src/components/SplashScreen';
import { oauthClient } from 'src/OAuth/oauthClient';
import { setupInterceptors } from 'src/request';
import { storeFactory } from 'src/store';
import { getEnvLocalStorageOverrides, storage } from 'src/utilities/storage';

import '@akamai/cds-tokens/tokens.css';
import '@akamai/cds-tokens/themes/dark/tokens.css';
// Resolved via vite alias — see vite.config.ts (@akamai/cds-components/font-family).
import '@akamai/cds-components/font-family';

import './index.css';
import { App } from './App';
import { API_ROOT, ENABLE_DEV_TOOLS } from './constants';
import { FeatureFlagProvider } from './featureFlags';
import { LinodeThemeWrapper } from './LinodeThemeWrapper';

const queryClient = queryClientFactory('longLived');
const store = storeFactory();

setupInterceptors(store);

if (import.meta.env.REACT_APP_ACCESS_TOKEN) {
  storage.authentication.token.set(import.meta.env.REACT_APP_ACCESS_TOKEN);
}

computeUiCoreApi.configure({
  prefixUrl: getEnvLocalStorageOverrides()?.apiRoot ?? API_ROOT,
  requestMiddleware: (request) => oauthClient.requestMiddleware(request),
  responseMiddleware: (response) => oauthClient.responseMiddleware(response),
});

const Main = () => {
  if (!navigator.cookieEnabled) {
    return <CookieWarning />;
  }

  return (
    <ReduxStoreProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <FeatureFlagProvider>
          <LinodeThemeWrapper>
            <CssBaseline enableColorScheme />
            <React.Suspense fallback={<SplashScreen />}>
              <App />
            </React.Suspense>
          </LinodeThemeWrapper>
        </FeatureFlagProvider>
      </QueryClientProvider>
    </ReduxStoreProvider>
  );
};

async function loadApp() {
  if (ENABLE_DEV_TOOLS && !window.location.pathname.includes('/lish/')) {
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
