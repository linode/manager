import { RouterProvider } from '@tanstack/react-router';
import * as React from 'react';

import { ErrorBoundaryFallback } from './features/ErrorBoundary/ErrorBoundaryFallback';
import { router } from './routes';

export const Router = () => {
  return (
    <ErrorBoundaryFallback>
      <RouterProvider router={router} />
    </ErrorBoundaryFallback>
  );
};
