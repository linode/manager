import { Outlet } from '@tanstack/react-router';
import * as React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useDialogContext } from 'src/context/useDialogContext';
import { ErrorBoundaryFallback } from 'src/features/ErrorBoundary/ErrorBoundaryFallback';

import { sessionExpirationContext } from './context/sessionExpirationContext';

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
    </SessionExpirationProvider>
  );
};
