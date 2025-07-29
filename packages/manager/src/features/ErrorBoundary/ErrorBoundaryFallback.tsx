import { ErrorBoundary } from '@sentry/react';
import * as React from 'react';

import { ErrorComponent } from './ErrorComponent';

interface ErrorBoundaryFallbackProps {
  children?: React.ReactNode;
}

export const ErrorBoundaryFallback = ({
  children,
}: ErrorBoundaryFallbackProps) => (
  <ErrorBoundary fallback={ErrorComponent}>{children}</ErrorBoundary>
);
