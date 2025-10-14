import {
  createRootRouteWithContext,
  ErrorComponent,
} from '@tanstack/react-router';

import { RootSwitch } from './../RootSwitch';

import type { RouterContext } from './types';

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootSwitch,
  errorComponent: ErrorComponent,
});
