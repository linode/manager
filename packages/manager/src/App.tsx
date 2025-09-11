import '@reach/tabs/styles.css';
import { RouterProvider } from '@tanstack/react-router';
import { useLDClient } from 'launchdarkly-react-client-sdk';
import * as React from 'react';

import {
  DocumentTitleSegment,
  withDocumentTitleProvider,
} from 'src/components/DocumentTitle';
import withFeatureFlagProvider from 'src/containers/withFeatureFlagProvider.container';
import { ErrorBoundaryFallback } from 'src/features/ErrorBoundary/ErrorBoundaryFallback';

import { SplashScreen } from './components/SplashScreen';
import { router } from './routes';

export const App = withDocumentTitleProvider(
  withFeatureFlagProvider(() => {
    const [isLoadingFlags, setIsLoadingFlags] = React.useState(true);
    const ldClient = useLDClient();

    React.useEffect(() => {
      if (ldClient) {
        ldClient
          .waitForInitialization(5)
          .finally(() => setIsLoadingFlags(false));
      }
    }, [ldClient]);

    if (isLoadingFlags) {
      return <SplashScreen />;
    }

    return (
      <ErrorBoundaryFallback>
        {/** Accessibility helper */}
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <div hidden>
          <span id="new-window">Opens in a new window</span>
          <span id="external-site">Opens an external site</span>
          <span id="external-site-new-window">
            Opens an external site in a new window
          </span>
        </div>
        <DocumentTitleSegment segment="Akamai Cloud Manager" />
        <RouterProvider
          context={{ flags: ldClient?.allFlags() }}
          router={router}
        />
      </ErrorBoundaryFallback>
    );
  })
);
