import {
  createRootRouteWithContext,
  ErrorComponent,
} from '@tanstack/react-router';

import type { RouterContext } from './types';

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  errorComponent: ErrorComponent,
});
