import { ErrorState } from '@linode/ui';
import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import React from 'react';

import { rootRoute } from '../root';

export const betaRouteTree = createRoute({
  getParentRoute: () => rootRoute,
  wrapInSuspense: true,
  preload: false,
  path: 'betas/*',
  errorComponent: () => (
    <ErrorState errorText="Betas app is currently offline." />
  ),
  component: lazyRouteComponent(() => import('betas/app')),
});
