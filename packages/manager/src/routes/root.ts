import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';

// import { Root } from '../Root';

import type { RouterContext } from './types';

/**
 * The root route should render the <Root /> component. However, because we are pregressively migrating to TanStack Router,
 * we are using the Outlet component since the Provider is still sitting in <MainContent />.
 */
export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
});
