import {
  createRootRouteWithContext,
  ErrorComponent,
  Outlet,
} from '@tanstack/react-router';

import { Root } from '../Root';

import type { RouterContext } from './types';

/**
 * The root route should render the <Root /> component. However, because we are progressively migrating to TanStack Router,
 * we are using the Outlet component since the Provider is still sitting in <MainContent />.
 */
export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: Root,
  errorComponent: ErrorComponent,
});

export const migrationRootRoute = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  errorComponent: ErrorComponent,
});
