import { createRootRouteWithContext } from '@tanstack/react-router';

import { Root } from '../Root';

import type { RouterContext } from './types';

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: Root,
});
