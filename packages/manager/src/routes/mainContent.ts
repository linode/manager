import { createRoute } from '@tanstack/react-router';

import { Root } from 'src/Root';

import { rootRoute } from './root';

export const mainContentRoute = createRoute({
  component: Root,
  getParentRoute: () => rootRoute,
  path: '/',
});
