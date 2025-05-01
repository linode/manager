import { ErrorBoundary } from '@sentry/react';
import { CatchBoundary } from '@tanstack/react-router';
import * as React from 'react';

import { ErrorComponent } from './ErrorComponent';

export const ErrorBoundaryFallback: React.FC<{
  children?: React.ReactNode;
  useTanStackRouterBoundary?: boolean;
}> = ({ children, useTanStackRouterBoundary = false }) => (
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
