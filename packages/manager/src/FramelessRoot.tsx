import { Outlet } from '@tanstack/react-router';
import * as React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useDialogContext } from 'src/context/useDialogContext';
import { ErrorBoundaryFallback } from 'src/features/ErrorBoundary/ErrorBoundaryFallback';

import { sessionExpirationContext } from './context/sessionExpirationContext';
import { useAdobeAnalytics } from './hooks/useAdobeAnalytics';
import { useNewRelic } from './hooks/useNewRelic';
import { usePendo } from './hooks/usePendo';
import { useSessionExpiryToast } from './hooks/useSessionExpiryToast';
import { useEventsPoller } from './queries/events/events';

export const FramelessRoot = () => {
  const SessionExpirationProvider = sessionExpirationContext.Provider;
  const sessionExpirationContextValue = useDialogContext({
    isOpen: false,
  });

  return (
    <SessionExpirationProvider value={sessionExpirationContextValue}>
      <React.Suspense fallback={<SuspenseLoader />}>
        <ErrorBoundaryFallback>
          <Outlet />
        </ErrorBoundaryFallback>
      </React.Suspense>
      <GlobalListeners />
    </SessionExpirationProvider>
  );
};

const GlobalListeners = () => {
  useEventsPoller();
  useAdobeAnalytics();
  usePendo();
  useNewRelic();
  useSessionExpiryToast();
  return null;
};
