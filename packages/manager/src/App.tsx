import '@reach/tabs/styles.css';
import { ErrorBoundary } from '@sentry/react';
import * as React from 'react';

import {
  DocumentTitleSegment,
  withDocumentTitleProvider,
} from 'src/components/DocumentTitle';
import withFeatureFlagConsumer from 'src/containers/withFeatureFlagConsumer.container';
import withFeatureFlagProvider from 'src/containers/withFeatureFlagProvider.container';
import TheApplicationIsOnFire from 'src/features/TheApplicationIsOnFire';

import { GoTo } from './GoTo';
import { MainContent } from './MainContent';
import { SplashScreen } from './components/SplashScreen';
import { useAdobeAnalytics } from './hooks/useAdobeAnalytics';
import { useInitialRequests } from './hooks/useInitialRequests';
import { useNewRelic } from './hooks/useNewRelic';
import { useEventsPoller } from './queries/events/events';
import { useSetupFeatureFlags } from './useSetupFeatureFlags';

// Ensure component's display name is 'App'
export const App = () => <BaseApp />;

const BaseApp = withDocumentTitleProvider(
  withFeatureFlagProvider(
    withFeatureFlagConsumer(() => {
      const { isLoading } = useInitialRequests();

      const { areFeatureFlagsLoading } = useSetupFeatureFlags();

      if (isLoading || areFeatureFlagsLoading) {
        return <SplashScreen />;
      }

      return (
        <ErrorBoundary fallback={<TheApplicationIsOnFire />}>
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
          <GoTo />
          <DocumentTitleSegment segment="Akamai Cloud Manager" />
          <MainContent />
          <GlobalListeners />
        </ErrorBoundary>
      );
    })
  )
);

const GlobalListeners = () => {
  useEventsPoller();
  useAdobeAnalytics();
  useNewRelic();
  return null;
};
