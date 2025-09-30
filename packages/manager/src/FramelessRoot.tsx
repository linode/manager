import { Outlet } from '@tanstack/react-router';
import * as React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { ErrorBoundaryFallback } from 'src/features/ErrorBoundary/ErrorBoundaryFallback';


export const FramelessRoot = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ErrorBoundaryFallback>
        <Outlet />
      </ErrorBoundaryFallback>
    </React.Suspense>
  );
};
