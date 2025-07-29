import '@reach/tabs/styles.css';
import * as React from 'react';

import {
  DocumentTitleSegment,
  withDocumentTitleProvider,
} from 'src/components/DocumentTitle';
import withFeatureFlagProvider from 'src/containers/withFeatureFlagProvider.container';
import { ErrorBoundaryFallback } from 'src/features/ErrorBoundary/ErrorBoundaryFallback';

import { SplashScreen } from './components/SplashScreen';
import { useInitialRequests } from './hooks/useInitialRequests';
import { Router } from './Router';
import { useSetupFeatureFlags } from './useSetupFeatureFlags';

export const App = withDocumentTitleProvider(
  withFeatureFlagProvider(() => {
    // Skip all initialization if we're on any authentication callback - just let the router handle it
    const isAuthCallback =
      window.location.pathname === '/oauth/callback' ||
      window.location.pathname === '/admin/callback';

    if (isAuthCallback) {
      return (
        <ErrorBoundaryFallback>
          <DocumentTitleSegment segment="Akamai Cloud Manager" />
          <Router />
        </ErrorBoundaryFallback>
      );
    }

    const { isLoading } = useInitialRequests();
    const { areFeatureFlagsLoading } = useSetupFeatureFlags();

    if (isLoading || areFeatureFlagsLoading) {
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
        <Router />
      </ErrorBoundaryFallback>
    );
  })
);
