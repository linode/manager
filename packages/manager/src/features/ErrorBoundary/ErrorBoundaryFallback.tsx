import { ErrorBoundary } from '@sentry/react';
import { CatchBoundary } from '@tanstack/react-router';
import * as React from 'react';

import { ErrorComponent } from './ErrorComponent';

interface ErrorBoundaryFallbackProps {
  children?: React.ReactNode;
  useTanStackRouterBoundary?: boolean;
}

export const ErrorBoundaryFallback = ({
  children,
  useTanStackRouterBoundary = false,
}: ErrorBoundaryFallbackProps) => (
  <ErrorBoundary fallback={ErrorComponent}>
    {useTanStackRouterBoundary ? (
      <CatchBoundary getResetKey={() => 'error-boundary-fallback'}>
        {children}
      </CatchBoundary>
    ) : (
      children
    )}
  </ErrorBoundary>
);
