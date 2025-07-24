import { ErrorBoundary } from '@sentry/react';
import { CatchBoundary } from '@tanstack/react-router';
import * as React from 'react';

import { ErrorComponent } from './ErrorComponent';

interface ErrorBoundaryFallbackProps {
  children?: React.ReactNode;
}

export const ErrorBoundaryFallback = ({
  children,
}: ErrorBoundaryFallbackProps) => (
  <ErrorBoundary fallback={ErrorComponent}>
    <CatchBoundary getResetKey={() => 'error-boundary-fallback'}>
      {children}
    </CatchBoundary>
  </ErrorBoundary>
);
